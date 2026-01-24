import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import pushNotificationService from "../services/pushNotification.service";

// =====================
// Posts
// =====================

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            userJourney: {
              select: {
                track: true,
                stage: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const total = await prisma.post.count();

    res.json({
      data: posts.map((post: any) => ({
        ...post,
        user: {
          ...post.user,
          avatarUrl: post.user.avatar_url,
          level: 1,
          totalXP: 0,
        },
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        likedByUser: req.user ? post.likes.some((l: any) => l.userId === req.user?.id) : false,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content, imageUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: "Content must be 500 characters or less" });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        content: content.trim(),
        imageUrl: imageUrl || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            userJourney: {
              select: {
                track: true,
                stage: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      data: {
        ...post,
        user: {
          ...post.user,
          avatarUrl: post.user.avatar_url,
          level: 1,
          totalXP: 0,
        },
        likesCount: 0,
        commentsCount: 0,
        likedByUser: false,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      return res.json({ liked: false });
    }

    await prisma.postLike.create({
      data: { postId, userId },
    });

    // Send push notification to post author
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: { select: { id: true, name: true } } },
      });
      
      const liker = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      if (post && post.userId !== userId && liker) {
        await pushNotificationService.notifyPostLiked(
          post.userId,
          liker.name,
          postId
        );
      }
    } catch (error) {
      console.error('Failed to send like notification:', error);
    }

    res.json({ liked: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
    });

    const userIds = [...new Set(comments.map((c: any) => c.userId))];
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    res.json({
      data: comments.map((c: any) => ({
        ...c,
        user: userMap.get(c.userId) || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId,
        content: content.trim(),
      },
    });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    // Send push notification to post author
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (post && post.userId !== userId && user) {
        await pushNotificationService.notifyPostCommented(
          post.userId,
          user.name,
          postId,
          content.trim()
        );
      }
    } catch (error) {
      console.error('Failed to send comment notification:', error);
    }

    res.status(201).json({
      data: {
        ...comment,
        user,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
};

// =====================
// Trading Pair Voting
// =====================

export const getVotes = async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.query;

    const where = symbol ? { symbol: String(symbol).toUpperCase() } : {};

    const votes = await prisma.tradingPairVote.groupBy({
      by: ["symbol", "vote"],
      where,
      _count: true,
    });

    const symbolVotes: Record<string, any> = {};
    
    for (const v of votes) {
      if (!symbolVotes[v.symbol]) {
        symbolVotes[v.symbol] = {
          symbol: v.symbol,
          STRONG_SELL: 0,
          SELL: 0,
          NEUTRAL: 0,
          BUY: 0,
          STRONG_BUY: 0,
          total: 0,
        };
      }
      symbolVotes[v.symbol][v.vote] = v._count;
      symbolVotes[v.symbol].total += v._count;
    }

    const results = Object.values(symbolVotes).map((sv: any) => {
      const weightedSum =
        sv.STRONG_SELL * -2 +
        sv.SELL * -1 +
        sv.NEUTRAL * 0 +
        sv.BUY * 1 +
        sv.STRONG_BUY * 2;
      
      const index = sv.total > 0 ? weightedSum / sv.total : 0;
      
      let sentiment = "Neutral";
      if (index <= -1.5) sentiment = "Strong Sell";
      else if (index <= -0.5) sentiment = "Sell";
      else if (index >= 1.5) sentiment = "Strong Buy";
      else if (index >= 0.5) sentiment = "Buy";

      return {
        ...sv,
        index: Math.round(index * 100) / 100,
        sentiment,
      };
    });

    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

export const castVote = async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, vote } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!symbol || !vote) {
      return res.status(400).json({ message: "Symbol and vote are required" });
    }

    const validVotes = ["STRONG_SELL", "SELL", "NEUTRAL", "BUY", "STRONG_BUY"];
    if (!validVotes.includes(vote)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const existingVote = await prisma.tradingPairVote.findUnique({
      where: {
        userId_symbol: { userId, symbol: symbol.toUpperCase() },
      },
    });

    if (existingVote) {
      const updated = await prisma.tradingPairVote.update({
        where: { id: existingVote.id },
        data: { vote, updatedAt: new Date() },
      });
      return res.json({ data: updated });
    }

    const newVote = await prisma.tradingPairVote.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        vote,
      },
    });

    res.status(201).json({ data: newVote });
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ message: "Failed to cast vote" });
  }
};

export const getMyVotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const votes = await prisma.tradingPairVote.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ data: votes });
  } catch (error) {
    console.error("Error fetching user votes:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

// =====================
// Promrkts Index (Aggregated Sentiment)
// =====================

export const getPromrktsIndex = async (req: AuthRequest, res: Response) => {
  try {
    const popularSymbols = ["BTCUSDT", "ETHUSDT", "EURUSD", "GBPUSD", "XAUUSD", "SPX500", "NAS100"];
    
    const votes = await prisma.tradingPairVote.groupBy({
      by: ["symbol", "vote"],
      where: {
        symbol: { in: popularSymbols },
      },
      _count: true,
    });

    const symbolData: Record<string, any> = {};
    
    for (const sym of popularSymbols) {
      symbolData[sym] = {
        symbol: sym,
        STRONG_SELL: 0,
        SELL: 0,
        NEUTRAL: 0,
        BUY: 0,
        STRONG_BUY: 0,
        total: 0,
      };
    }

    for (const v of votes) {
      if (symbolData[v.symbol]) {
        symbolData[v.symbol][v.vote] = v._count;
        symbolData[v.symbol].total += v._count;
      }
    }

    const results = Object.values(symbolData).map((sv: any) => {
      const weightedSum =
        sv.STRONG_SELL * -2 +
        sv.SELL * -1 +
        sv.NEUTRAL * 0 +
        sv.BUY * 1 +
        sv.STRONG_BUY * 2;
      
      const index = sv.total > 0 ? weightedSum / sv.total : 0;
      
      let sentiment = "Neutral";
      let color = "#888";
      if (index <= -1.5) { sentiment = "Strong Sell"; color = "#ef4444"; }
      else if (index <= -0.5) { sentiment = "Sell"; color = "#f97316"; }
      else if (index >= 1.5) { sentiment = "Strong Buy"; color = "#22c55e"; }
      else if (index >= 0.5) { sentiment = "Buy"; color = "#84cc16"; }

      return {
        ...sv,
        index: Math.round(index * 100) / 100,
        sentiment,
        color,
      };
    });

    const totalVotes = results.reduce((sum: number, r: any) => sum + r.total, 0);
    const overallIndex = totalVotes > 0
      ? results.reduce((sum: number, r: any) => sum + r.index * r.total, 0) / totalVotes
      : 0;

    let overallSentiment = "Neutral";
    if (overallIndex <= -1.5) overallSentiment = "Strong Sell";
    else if (overallIndex <= -0.5) overallSentiment = "Sell";
    else if (overallIndex >= 1.5) overallSentiment = "Strong Buy";
    else if (overallIndex >= 0.5) overallSentiment = "Buy";

    res.json({
      data: {
        symbols: results,
        overall: {
          index: Math.round(overallIndex * 100) / 100,
          sentiment: overallSentiment,
          totalVotes,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching Promrkts Index:", error);
    res.status(500).json({ message: "Failed to fetch index" });
  }
};

// =====================
// User Profile
// =====================

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const [postsCount, followersCount, followingCount] = await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.userFollow.count({ where: { followingId: userId } }),
      prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    const isFollowing = req.user
      ? !!(await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId: req.user.id,
              followingId: userId,
            },
          },
        }))
      : false;

    res.json({
      data: {
        ...user,
        ...profile,
        postsCount,
        followersCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bio, avatarUrl, bannerUrl, location, website, twitterHandle, telegramHandle } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        bio,
        avatarUrl,
        bannerUrl,
        location,
        website,
        twitterHandle,
        telegramHandle,
        updatedAt: new Date(),
      },
      create: {
        userId,
        bio,
        avatarUrl,
        bannerUrl,
        location,
        website,
        twitterHandle,
        telegramHandle,
      },
    });

    res.json({ data: profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.user?.id;
    const { userId: followingId } = req.params;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existing) {
      await prisma.userFollow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    }

    await prisma.userFollow.create({
      data: { followerId, followingId },
    });

    res.json({ following: true });
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({ message: "Failed to toggle follow" });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim().length < 2) {
      return res.json({ data: [] });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        userJourney: {
          select: {
            track: true,
            stage: true,
          },
        },
      },
      take: limit,
    });

    res.json({
      data: users.map((user: any) => ({
        ...user,
        avatarUrl: user.avatar_url,
        level: 1,
        totalXP: 0,
      })),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

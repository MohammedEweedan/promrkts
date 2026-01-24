import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

// =====================
// Trading Groups
// =====================

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.query;
    const userId = req.user?.id;

    const where: any = { isPublic: true };
    if (symbol) {
      where.symbol = String(symbol).toUpperCase();
    }

    const groups = await prisma.tradingGroup.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    // Check if user is member of each group
    let membershipMap: Record<string, boolean> = {};
    if (userId) {
      const memberships = await prisma.tradingGroupMember.findMany({
        where: {
          userId,
          groupId: { in: groups.map((g: any) => g.id) },
        },
        select: { groupId: true },
      });
      membershipMap = Object.fromEntries(memberships.map((m: any) => [m.groupId, true]));
    }

    res.json({
      data: groups.map((g: any) => ({
        ...g,
        membersCount: g._count.members,
        messagesCount: g._count.messages,
        isMember: membershipMap[g.id] || false,
      })),
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, symbol, description, imageUrl, isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || !symbol) {
      return res.status(400).json({ message: "Name and symbol are required" });
    }

    const group = await prisma.tradingGroup.create({
      data: {
        name,
        symbol: symbol.toUpperCase(),
        description,
        imageUrl,
        isPublic: isPublic !== false,
        creatorId: userId,
      },
    });

    // Add creator as admin member
    await prisma.tradingGroupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: "ADMIN",
      },
    });

    res.status(201).json({ data: group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const getGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    const group = await prisma.tradingGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let membership = null;
    if (userId) {
      membership = await prisma.tradingGroupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId },
        },
      });
    }

    res.json({
      data: {
        ...group,
        membersCount: group._count.members,
        messagesCount: group._count.messages,
        isMember: !!membership,
        role: membership?.role || null,
      },
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Failed to fetch group" });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const group = await prisma.tradingGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const existing = await prisma.tradingGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (existing) {
      // Leave group
      await prisma.tradingGroupMember.delete({
        where: { id: existing.id },
      });
      return res.json({ joined: false });
    }

    // Join group
    await prisma.tradingGroupMember.create({
      data: {
        groupId,
        userId,
        role: "MEMBER",
      },
    });

    res.json({ joined: true });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Failed to join group" });
  }
};

export const getGroupMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await prisma.tradingGroupMessage.findMany({
      where: { groupId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get user info
    const userIds = [...new Set(messages.map((m: { userId: any; }) => m.userId))];
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    res.json({
      data: messages.map((m: any) => ({
        ...m,
        user: userMap.get(m.userId) || null,
      })).reverse(), // Oldest first for chat display
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendGroupMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Check membership
    const membership = await prisma.tradingGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "You must join the group to send messages" });
    }

    const message = await prisma.tradingGroupMessage.create({
      data: {
        groupId,
        userId,
        content: content.trim(),
        imageUrl,
      },
    });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({
      data: {
        ...message,
        user,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMyGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const memberships = await prisma.tradingGroupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
                messages: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    res.json({
      data: memberships.map((membership: any) => ({
        ...membership.group,
        membersCount: membership.group._count.members,
        messagesCount: membership.group._count.messages,
        role: membership.role,
        isMember: true,
      })),
    });
  } catch (error) {
    console.error("Error fetching my groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { socialAPI } from "../api/client";
import api from "../api/client";

/* ----------------------------- Tab Components ----------------------------- */

const PostsTab = ({ user, colors }: { user: any; colors: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const response = await api.get(`/social/posts/user/${user.id}`);
        if (!mounted) return;
        setPosts(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (!mounted) return;
        setPosts([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (user?.id) fetchPosts();
    else setLoading(false);

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.tabContentInner}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.tabContentInner}>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>No posts yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContentInner}>
      {posts.map((post) => (
        <View
          key={post.id}
          style={[
            styles.postItem,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.postActionText, { color: colors.textMuted }]}>
                {post.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.postActionText, { color: colors.textMuted }]}>
                {post.comments || 0}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.postTime, { color: colors.textMuted }]}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const BadgesTab = ({ user, colors }: { user: any; colors: any }) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBadges = async () => {
      try {
        const response = await api.get(`/badges/user/${user.id}`);
        if (!mounted) return;
        setBadges(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (!mounted) return;
        setBadges([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (user?.id) fetchBadges();
    else setLoading(false);

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.tabContentInner}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!badges.length) {
    return (
      <View style={styles.tabContentInner}>
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            No badges earned yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContentInner}>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
          <View key={badge.id} style={[styles.badgeItem, { backgroundColor: colors.card }]}>
            <Text style={styles.badgeIcon}>{badge.icon || "🏆"}</Text>
            <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
            <Text style={[styles.badgeDescription, { color: colors.textMuted }]} numberOfLines={2}>
              {badge.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const MediaTab = ({ user, colors }: { user: any; colors: any }) => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchMedia = async () => {
      try {
        const response = await api.get(`/media/user/${user.id}`);
        if (!mounted) return;
        setMedia(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (!mounted) return;
        setMedia([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (user?.id) fetchMedia();
    else setLoading(false);

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.tabContentInner}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!media.length) {
    return (
      <View style={styles.tabContentInner}>
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            No media uploaded yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContentInner}>
      <View style={styles.mediaGrid}>
        {media.map((item) => (
          <View key={item.id} style={styles.mediaItem}>
            <View style={[styles.mediaThumbnail, { backgroundColor: colors.card }]}>
              <Ionicons
                name={item.type === "video" ? "play-circle" : "image"}
                size={32}
                color={colors.textMuted}
              />
            </View>
            <Text style={[styles.mediaTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title || item.filename}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const TradingTab = ({ user, colors }: { user: any; colors: any }) => {
  const [tradingData, setTradingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTradingData = async () => {
      try {
        // NOTE: You used getMyVotes() — if you want "user's votes", replace with an endpoint that accepts user.id
        const response = await socialAPI.getMyVotes();
        if (!mounted) return;
        setTradingData(response.data || {});
      } catch {
        if (!mounted) return;
        setTradingData(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchTradingData();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.tabContentInner}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const votes = tradingData || {};
  const totalVotes = Object.keys(votes).length;
  const buySignals = Object.values(votes).filter(
    (v: any) => v === "BUY" || v === "STRONG_BUY"
  ).length;
  const sellSignals = Object.values(votes).filter(
    (v: any) => v === "SELL" || v === "STRONG_SELL"
  ).length;

  return (
    <View style={styles.tabContentInner}>
      <View style={[styles.tradingCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.tradingTitle, { color: colors.text }]}>Trading Activity</Text>
        <Text style={[styles.tradingSubtitle, { color: colors.textMuted }]}>
          {user?.name
            ? `${user.name}'s market predictions and votes`
            : "Market predictions and votes"}
        </Text>

        <View style={styles.tradingStats}>
          <View style={styles.tradingStatItem}>
            <Text style={[styles.tradingStatNumber, { color: colors.primary }]}>{totalVotes}</Text>
            <Text style={[styles.tradingStatLabel, { color: colors.textMuted }]}>Total Votes</Text>
          </View>

          <View style={styles.tradingStatItem}>
            <Text style={[styles.tradingStatNumber, { color: colors.success }]}>{buySignals}</Text>
            <Text style={[styles.tradingStatLabel, { color: colors.textMuted }]}>Buy Signals</Text>
          </View>

          <View style={styles.tradingStatItem}>
            <Text style={[styles.tradingStatNumber, { color: "#ef4444" }]}>{sellSignals}</Text>
            <Text style={[styles.tradingStatLabel, { color: colors.textMuted }]}>Sell Signals</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.viewFullTradingButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.viewFullTradingButtonText}>View Full Trading Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ------------------------------- Header ---------------------------------- */

type HeaderProps = {
  showMenu?: boolean;
  onMenuPress?: () => void;
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void; // ✅ ADD THIS BACK
};

export default function Header({
  showMenu = false,
  onMenuPress,
  showNotifications = false,
  onNotificationPress,
  showSettings = false,
  onSettingsPress,
  showBack = false,
  onBackPress,
  showSearch = false,
}: HeaderProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Search
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "trading" | "badges" | "media">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const [userStats, setUserStats] = useState<any>({
    followers: 0,
    following: 0,
    level: 1,
    totalXP: 0,
    badges: [],
    hasSubscription: false,
  });

  const closeAllModals = () => {
    setShowSettingsMenu(false);
    setShowProfileModal(false);
    setShowSearchModal(false);
  };

  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await socialAPI.searchUsers(q, 20);
      const results = response.data?.data || [];
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openUserProfile = async (u: any) => {
    setSelectedUser(u);
    setActiveTab("posts");
    setShowSettingsMenu(false);
    setShowProfileModal(true);
    setShowSearchModal(false);

    try {
      const [followersResp, followingResp, badgesResp, subscriptionsResp] = await Promise.all([
        socialAPI.getFollowers(u.id).catch(() => ({ data: { data: [] } })),
        socialAPI.getFollowing(u.id).catch(() => ({ data: { data: [] } })),
        api.get(`/badges/user/${u.id}`).catch(() => ({ data: [] })),
        api.get(`/subscriptions/user/${u.id}`).catch(() => ({ data: [] })),
      ]);

      const followers = followersResp.data?.data?.length || 0;
      const following = followingResp.data?.data?.length || 0;
      const badges = Array.isArray(badgesResp.data) ? badgesResp.data : [];
      const hasSubscription = (subscriptionsResp.data?.length || 0) > 0;

      setUserStats({
        followers,
        following,
        level: u.level || 1,
        totalXP: u.totalXP || 0,
        badges,
        hasSubscription,
      });

      // If you have an endpoint to check following status, plug it here.
      setIsFollowing(false);
      setIsBlocked(false);
    } catch {
      setUserStats({
        followers: 0,
        following: 0,
        level: u.level || 1,
        totalXP: u.totalXP || 0,
        badges: [],
        hasSubscription: false,
      });
      setIsFollowing(false);
      setIsBlocked(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!selectedUser || isBlocked) return;

    try {
      await socialAPI.followUser(selectedUser.id);
      const next = !isFollowing;
      setIsFollowing(next);
      Alert.alert(
        "Success",
        next ? `You are now following ${selectedUser.name}` : `You unfollowed ${selectedUser.name}`
      );
    } catch {
      Alert.alert("Error", "Failed to follow/unfollow user");
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      await api.post(`/social/profile/${selectedUser.id}/block`);
      setIsBlocked(true);
      setShowSettingsMenu(false);
      Alert.alert("Success", `You have blocked ${selectedUser.name}`);
    } catch {
      Alert.alert("Error", "Failed to block user");
    }
  };

  const handleReportUser = () => {
    if (!selectedUser) return;

    Alert.alert("Report User", `Are you sure you want to report ${selectedUser.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () => {
          setShowSettingsMenu(false);
          Alert.alert("Report Submitted", "Thank you for your report. We will review it shortly.");
        },
      },
    ]);
  };

  const handleMuteUser = () => {
    if (!selectedUser) return;

    Alert.alert("Mute User", `Are you sure you want to mute ${selectedUser.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mute",
        onPress: () => {
          setShowSettingsMenu(false);
          Alert.alert(
            "User Muted",
            `You will no longer see notifications from ${selectedUser.name}`
          );
        },
      },
    ]);
  };

  // ✅ Key request: navigate to Messages WITHOUT leaving profile modal open
  const handleMessageUser = () => {
    if (!selectedUser || isBlocked) return;

    // close modal first
    closeAllModals();

    // then navigate
    requestAnimationFrame(() => {
      (navigation as any).navigate("Messages", { user: selectedUser });
    });
  };

  const ProfileTabButtons = useMemo(() => ["posts", "trading", "badges", "media"] as const, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {showBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : showMenu ? (
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/app-logo.gif")}
          style={styles.textLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.rightIcons}>
        {showSearch ? (
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        {showNotifications ? (
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        {showSettings ? (
          <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        {!showSearch && !showNotifications && !showSettings && (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      {/* ---------------------------- SEARCH MODAL ---------------------------- */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={[styles.searchModalContainer, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.searchHeader,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <TextInput
              style={[styles.searchInput, { color: colors.text, backgroundColor: colors.inputBg }]}
              placeholder="Search users by name or username..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            {searchLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>

          <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
            {Array.isArray(searchResults) &&
              searchResults.map((u: any) => (
                <View
                  key={u.id}
                  style={[
                    styles.userResult,
                    { backgroundColor: colors.card, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "U"}
                      </Text>
                    </View>

                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                        {u.name}
                      </Text>
                      <Text
                        style={[styles.userUsername, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        @{u.username || u.email?.split("@")[0]}
                      </Text>
                      {!!u.email && (
                        <Text
                          style={[styles.userEmail, { color: colors.textMuted }]}
                          numberOfLines={1}
                        >
                          {u.email}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.viewProfileButton, { backgroundColor: colors.primary }]}
                    onPress={() => openUserProfile(u)}
                  >
                    <Text style={styles.viewProfileButtonText}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              ))}

            {searchQuery.trim() && !searchResults.length && !searchLoading ? (
              <View style={styles.noResults}>
                <Ionicons name="search" size={48} color={colors.textMuted} />
                <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                  No users found for "{searchQuery}"
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* ---------------------------- PROFILE MODAL --------------------------- */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowSettingsMenu(false);
          setShowProfileModal(false);
        }}
      >
        <View style={[styles.profileModalContainer, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.profileHeader,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setShowSettingsMenu(false);
                setShowProfileModal(false);
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.profileTitle, { color: colors.text }]}>User Profile</Text>
            <View style={styles.iconPlaceholder} />
          </View>

          {!!selectedUser && (
            <View style={styles.profileContent}>
              <View style={[styles.profileAvatarContainer, { backgroundColor: colors.card }]}>
                {/* settings (3 dots) */}
                <TouchableOpacity
                  style={[
                    styles.settingsButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setShowSettingsMenu((v) => !v)}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
                </TouchableOpacity>

                {showSettingsMenu && (
                  <>
                    {/* tap outside to close */}
                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={() => setShowSettingsMenu(false)}
                    />
                    <View
                      style={[
                        styles.settingsMenu,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <TouchableOpacity style={styles.menuItem} onPress={handleReportUser}>
                        <Ionicons name="flag-outline" size={16} color={colors.text} />
                        <Text style={[styles.menuItemText, { color: colors.text }]}>Report</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.menuItem} onPress={handleBlockUser}>
                        <Ionicons name="person-remove-outline" size={16} color="#ef4444" />
                        <Text style={[styles.menuItemText, { color: "#ef4444" }]}>Block</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={handleMuteUser}
                      >
                        <Ionicons name="volume-mute-outline" size={16} color={colors.text} />
                        <Text style={[styles.menuItemText, { color: colors.text }]}>Mute</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View style={styles.avatarContainer}>
                  {selectedUser.avatar_url || selectedUser.avatarUrl ? (
                    <Image
                      source={{ uri: selectedUser.avatar_url || selectedUser.avatarUrl }}
                      style={styles.profileAvatarImage}
                    />
                  ) : (
                    <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.profileAvatarText}>
                        {selectedUser.name?.[0]?.toUpperCase() ||
                          selectedUser.email?.[0]?.toUpperCase() ||
                          "U"}
                      </Text>
                    </View>
                  )}

                  {userStats.hasSubscription && (
                    <View style={styles.vipBadge}>
                      <Text style={styles.vipBadgeText}>VIP</Text>
                    </View>
                  )}

                  {userStats.badges?.length > 0 && (
                    <View style={styles.badgeBubble}>
                      <Text style={styles.badgeBubbleText}>{userStats.badges.length}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.profileName, { color: colors.text }]}>
                  {selectedUser.name}
                </Text>
                <Text style={[styles.profileUsername, { color: colors.textMuted }]}>
                  @{selectedUser.username || selectedUser.email?.split("@")[0]}
                </Text>

                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>
                      {userStats.followers}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>
                      {userStats.following}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>
                      {userStats.level}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Level</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.success }]}>XP</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                      {userStats.totalXP}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      {
                        backgroundColor: isFollowing ? colors.card : colors.primary,
                        opacity: isBlocked ? 0.5 : 1,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleFollowToggle}
                    disabled={isBlocked}
                  >
                    <Text
                      style={[
                        styles.followButtonText,
                        { color: isFollowing ? colors.text : "#fff" },
                      ]}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.messageButton,
                      {
                        backgroundColor: colors.primary,
                        borderColor: "transparent",
                        opacity: isBlocked ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleMessageUser}
                    disabled={isBlocked}
                  >
                    <Ionicons name="mail-outline" size={14} color="#fff" />
                    <Text style={[styles.messageButtonText, { color: "#fff" }]}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.tabContainer,
                  { backgroundColor: colors.card, borderBottomColor: colors.border },
                ]}
              >
                {ProfileTabButtons.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tabButton,
                      activeTab === tab && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        { color: activeTab === tab ? "#fff" : colors.textMuted },
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
                {activeTab === "posts" && <PostsTab user={selectedUser} colors={colors} />}
                {activeTab === "trading" && <TradingTab user={selectedUser} colors={colors} />}
                {activeTab === "badges" && <BadgesTab user={selectedUser} colors={colors} />}
                {activeTab === "media" && <MediaTab user={selectedUser} colors={colors} />}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------- Styles ---------------------------------- */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  textLogo: {
    width: 150,
    height: 45,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* Search Modal */
  searchModalContainer: { flex: 1 },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  searchResults: { flex: 1 },
  userResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  viewProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewProfileButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },

  /* Profile Modal */
  profileModalContainer: { flex: 1 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  profileContent: { flex: 1 },

  profileAvatarContainer: {
    alignItems: "center",
    padding: 24,
    margin: 16,
    borderRadius: 16,
    position: "relative",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
  },
  vipBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  badgeBubble: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#22c55e",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeBubbleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },

  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
  },

  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "600" },
  statLabel: { fontSize: 12, marginTop: 4 },

  profileActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  followButton: {
    marginTop: 0,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  followButtonText: { fontSize: 16, fontWeight: "600" },

  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  messageButtonText: { fontSize: 16, fontWeight: "600" },

  settingsButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 5,
  },
  settingsMenu: {
    position: "absolute",
    top: 52,
    right: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* Tabs */
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContentInner: {
    paddingTop: 16,
  },

  /* Posts */
  postItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postActionText: { fontSize: 12 },
  postTime: { fontSize: 12, marginLeft: "auto" },

  /* Badges */
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  badgeDescription: { fontSize: 12, textAlign: "center" },

  /* Media */
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaItem: {
    width: "48%",
    marginBottom: 12,
  },
  mediaThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mediaTitle: { fontSize: 12, textAlign: "center" },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },

  /* Trading */
  tradingCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  tradingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  tradingSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  tradingStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tradingStatItem: { alignItems: "center" },
  tradingStatNumber: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  tradingStatLabel: { fontSize: 12 },
  viewFullTradingButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  viewFullTradingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

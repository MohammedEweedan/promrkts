import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      Forex_Gold_Indices: "Forex / Gold / Indices",
      Crypto: "Crypto",
      All_Forex_Headlines: "All Forex Headlines",
      Forex_Timeline: "Forex Timeline",
      Gold_XAUUSD_Headlines: "Gold (XAUUSD) Headlines",
      Gold_Timeline: "Gold Timeline",
      Indices_Headlines: "Indices Headlines",
      Indices_Timeline: "Indices Timeline",
      All_Crypto_Headlines: "All Crypto Headlines",
      Crypto_Timeline: "Crypto Timeline",
      brand: "promrkts",
      meta: {
        brand: "promrkts",
        default: { title: "promrkts" },
        home: { title: "Home" },
        products: { title: "Courses" },
        productDetail: { title: "Course Details" },
        checkout: { title: "Checkout" },
        learn: { title: "Learn" },
        enrolled: { title: "My Courses" },
        contact: { title: "Contact Us" },
        login: { title: "Sign In" },
        forgotPassword: { title: "Forgot Password" },
        resetPassword: { title: "Reset Password" },
        register: { title: "Create Account" },
        dashboard: { title: "Dashboard" },
        path: { title: "My Path" },
        progress: { title: "My Progress" },
        account: { title: "Account Settings" },
        "admin.index": { title: "Admin" },
        "admin.verifications": { title: "Admin • Verifications" },
        "admin.content": { title: "Admin • Content" },
        "admin.progress": { title: "Admin • Progress" },
        resources: { title: "Resources" },
        faq: { title: "FAQ" },
        policy: { title: "Privacy Policy" },
        terms: { title: "Terms of Service" },
        about: { title: "About Us" },
        careers: { title: "Careers" },
        cryptoGuide: { title: "USDT Guide" },
        token: { title: "Token" },
        tokenCheckout: { title: "Token Checkout" },
        discord: { title: "Discord Floor" },
        apply: { title: "Apply" },
        broker: { title: "Broker" },
        notFound: { title: "Page Not Found" },
      },
      spin: {
        error: "Failed to spin",
        description: "Spin the wheel to win a discount or VIP access!",
        button: "Spin Now",
        won: "You won {{value}}% off!",
        code: "Code:",
        valid: "Use it at checkout. Valid for 7 days.",
        vip_title: "VIP Month!",
        vip_message: "Congrats! You won 1 month VIP access. Create an account to claim.",
        title: "Spin & Win",
        close: "Close"
      },
      nav: {
        search: 'Search',
        enrolled: 'Enrolled',
        signIn: 'Sign In',
        signOut: 'Sign Out',
        contact: 'Contact',
      },
      path: {
        title: "Your path to funded trading",
        subtitle: "Follow the staged milestones to unlock community access, dashboard tools, evaluation challenges, and live capital.",
        signInCta: "Sign in to view your path",
        createAccountCta: "Create account",
        signInPrompt: "Sign in to see personalized steps for your journey.",
        currentStageLabel: "Current stage",
        readinessLabel: "Readiness checklist",
        readinessComplete: "Ready for Evaluation",
        readinessProgress: "{{percent}}% done",
        readinessHint: "Complete lessons, quiz, and dashboard layout.",
        readinessMissing: "Still missing: {{items}}",
        dashboardAccessLabel: "Dashboard access",
        dashboardUnlocked: "Unlocked",
        dashboardLocked: "Locked",
        dashboardUnlockedCopy: "You can create up to {{workspaces}} workspace(s) and {{widgets}} widgets.",
        dashboardLockedCopy: "Confirm a core or VIP course to unlock custom dashboards.",
        evaluationLabel: "Evaluation eligibility",
        evaluationEligible: "Eligible now",
        evaluationPending: "Pending checklist",
        evaluationEligibleCopy: "You can purchase an evaluation challenge whenever you're ready.",
        evaluationPendingCopy: "Finish the readiness checklist to unlock evaluation purchases.",
        missing: {
          quizPassed: "Readiness quiz",
          hasCoursePurchase: "Confirmed course",
          hasCourseProgress: "Lesson progress",
          hasDashboardLayout: "Saved dashboard layout"
        },
        nudgeTitle: "Unlock your next stage",
        nudgeDescription: "Finish the guided steps to activate dashboards, readiness, and evaluation access.",
        openPath: "Open My Path",
        stages: {
          SIGNED_UP: "Signed up",
          LEARNING: "Learning",
          COMMUNITY: "Community",
          DASHBOARD: "Dashboard",
          EVAL_READY: "Eval Ready",
          EVALUATING: "Evaluation",
          FUNDED: "Funded",
          EXECUTING: "Executing"
        },
        steps: {
          learning: {
            badge: "Stage • Learning",
            title: "Lock in your fundamentals",
            description: "Complete the core course modules and pass the built-in quizzes to progress.",
            subtext: "Every completed lesson boosts your XP and streak.",
            primaryCta: "Browse courses",
            secondaryCta: "View progress"
          },
          community: {
            badge: "Stage • Community",
            title: "Unlock the private community",
            description: "Access Telegram, Discord, and priority office hours once you confirm a VIP course or subscription.",
            unlockedSubtext: "Community access unlocked — check your email for invite links.",
            lockedSubtext: "Confirm a VIP course or subscription to enable Telegram & Discord.",
            primaryUnlocked: "Open Discord",
            primaryLocked: "See products"
          },
          dashboard: {
            badge: "Stage • Dashboard",
            title: "Customize your trading workspace",
            description: "Use widgets for charts, news, and playbooks inside your personalized dashboard.",
            unlockedSubtext: "Workspaces available: {{count}}",
            lockedSubtext: "Unlock via a confirmed course or subscription.",
            primaryCta: "Open dashboard"
          },
          readiness: {
            badgeReady: "Ready",
            badgeProgress: "{{complete}}/{{total}} complete",
            title: "Complete readiness checklist",
            description: "Pass the readiness quiz, finish your course, and save a dashboard layout.",
            subtextReady: "All requirements satisfied.",
            subtextProgress: "Checklist in progress.",
            primaryCta: "See requirements",
            secondaryCta: "Review overview"
          },
          evaluation: {
            badge: "Stage • Evaluation",
            title: "Start your evaluation challenge",
            description: "Choose the evaluation account size you’d like to trade. Our coaches guide you through the rules.",
            unlockedSubtext: "You’re eligible to purchase an evaluation challenge.",
            lockedSubtext: "Complete readiness so we can unlock evaluation purchases.",
            primaryUnlocked: "Browse challenges",
            primaryLocked: "Contact success team"
          },
          execution: {
            badge: "Stage • Execute",
            title: "Go live & scale",
            description: "After passing your evaluation and receiving your first payout, connect to the broker and keep scaling.",
            fundedSubtext: "Payout recorded — your success coach will guide the broker handoff.",
            pendingSubtext: "Complete your evaluation to unlock funded trading.",
            primaryCta: "Talk to success coach"
          }
        }
      },
      ai: {
        coach: {
          title: "Meet Your Trading Coach",
          subtitle: "Adaptive lessons, instant feedback, and strategy simulations tailored to you — available 24/7 in Arabic, French, and English.",
          card1: "Adaptive Curriculum",
          card1_desc: "Learns your style, strengths, and gaps. Accelerates tough topics and skips what you’ve mastered.",
          card2: "Trade Sim & Debrief",
          card2_desc: "Replay entries, exits, and management in context. Get reasoned critiques, not just scores.",
          card3: "Shariah-Aligned",
          card3_desc: "Spot settlement, no riba, minimized gharar. Clear guidance on compliant methods.",
          cta: {
            primary: "Try our personal coach",
            secondary: "See how it works"
          }
        },
        metrics: {
          active_programs_label: "Active programs",
          active_programs_helper: "Currently in progress",
          streak_label: "Learning streak",
          days: "days",
          streak_helper: "Keep it up to unlock badges",
          hours_label: "Hours learned",
          hrs: "hrs",
          hours_helper: "Last 30 days (approx.)",
          completion_label: "Path completion",
          completion_helper: "Across all active programs",
        },
        offers_block: {
          welcome_title: "Welcome Offer",
          welcome_desc: "New student discount",
        },
        how: {
          title: "How It Works",
          step1: "Profile & Goals",
          step1_desc: "Tell us your time, risk comfort, and objectives.",
          step2: "Adaptive Lessons",
          step2_desc: "Bite-size modules tuned to your pace in AR/FR/EN.",
          step3: "Simulate & Practice",
          step3_desc: "Run strategy sims with guided debriefs.",
          step4: "Go Live (Optional)",
          step4_desc: "Bridge to compliant brokers."
        }
      },
      crypto: {
        title: "USDT Guide",
        subtitle: "A concise, trustworthy walkthrough for buying, sending, and verifying USDT safely.",
        what_is_usdt: {
          title: "What is USDT?",
          desc: "USDT (Tether) is a stablecoin designed to mirror the value of the US dollar across multiple blockchains."
        },
        note_stablecoin: "USDT is a stablecoin designed to track the US dollar (1 USDT ≈ $1).",
        chains: {
          title: "Networks that support USDT",
          desc: "USDT exists on several blockchains. Fees and speeds differ by network.",
          erc20: "Widely supported, higher fees during congestion.",
          bep20: "Lower fees than ERC20; compatible with BNB Smart Chain wallets.",
          trc20: "Usually the cheapest and fastest for USDT transfers."
        },
        fees_tip: "Tip: TRC20 is usually the cheapest and fastest for USDT transfers.",
        buy: {
          title: "How to buy USDT",
          desc: "Choose a reputable exchange or a verified local vendor.",
          global_title: "Global exchanges",
          libya_title: "Buying in Libya",
          libya_desc: "Use trusted exchanges or well-reviewed local exchange offices."
        },
        kyc_warning: "Use verified vendors and complete KYC where required. Avoid P2P trades without escrow.",
        send: {
          title: "How to send USDT",
          desc: "Always verify the wallet address and network before sending.",
          steps: {
            1: "Copy the receiver’s wallet address exactly.",
            2: "Select the correct network (e.g., TRC20).",
            3: "Send a small test first to confirm.",
            4: "Send the full amount once confirmed."
          }
        },
        txn: {
          title: "Sample transaction hash",
          desc: "This is what a blockchain transaction ID (hash) can look like.",
          note: "You can track this hash on a public blockchain explorer."
        },
        network_match_tip: "Always match the network on both sender and receiver (e.g., TRC20 ↔ TRC20).",
        guide: {
          quick: {
            title: "Quick guide: buy → set network → send → confirm",
            buy: "Purchase USDT on an exchange or from a verified local vendor.",
            network: "Choose TRC20 unless instructed otherwise for fees/speed.",
            verify: "Paste the address, check first/last 4 chars, send a $1 test, then the full amount."
          }
        },
        faq: {
          title: "FAQ",
          network_wrong: {
            q: "What if I pick the wrong network?",
            a: "Funds may be lost. Always confirm the network with the receiver before sending."
          },
          fees: {
            q: "Why did I receive less?",
            a: "Exchanges and networks charge fees. Send slightly more or account for fees ahead of time."
          }
        },
        video: {
          title: "Video guide: Buy & Send USDT (TRC20)",
          desc: "Watch this step-by-step tutorial on buying USDT (TRC20) and sending it safely.",
          url: ""
        },
        cta_enroll: "Enroll now",
        cta_disclaimer: "Educational content only. This is not financial advice."
      },
      actions: {
        refresh: "Refresh",
        view_details: "View details",
        enroll: "Enroll",
        confirm: "Confirm",
        fail: "Fail",
        verify: "Verify",
        crypto_guide: "Guide to crypto",
      },
      notes: {
        usdt_trc20: "All USDT deposits must be sent via the TRC20 (TRON) network.",
        network_reminder: "Use TRC20 network for USDT payments."
      },
      sections: {
        pending_payments: "Pending Payments",
        pending_users: "Pending Users",
        pending_businesses: "Pending Businesses"
      },
      statuses: {
        pending: "Pending",
        confirmed: "Confirmed",
        failed: "Failed"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "User: {{name}} ({{email}})",
        course_line: "Course: {{course}}",
        proof_line: "Proof: {{hash}}",
        created_at: "Created: {{date}}",
        owner_line: "Owner: {{owner}}",
        yes: "Yes",
        no: "No",
        na: "n/a"
      },
      empty_states: {
        no_pending_payments: "No pending payments.",
        no_pending_users: "No pending users.",
        no_pending_businesses: "No pending businesses."
      },
      forbidden: {
        title: "Forbidden",
        message: "You must be an admin to view this page."
      },
      checkout: {
        title: "Checkout",
        subtitle: "Secure your seat with fast, flexible payment methods.",
        free: "Free",
        no_tier: "No course tier selected. Go back and choose a course.",
        already_enrolled: "You already own this course. Enjoy learning!",
        customer: {
          details: "Customer Details",
          full_name: "Full Name",
          email: "Email",
          country: "Country/Region",
          pref_lang: "Preferred Course Language"
        },
        lang: { en: "English", ar: "Arabic", fr: "French" },
        placeholders: {
          name: "Your name",
          country: "Choose country"
        },
        payment: {
          title: "Payment Method",
          usdt: "USDT (TRC20)",
          libyana: "Libyana Balance",
          madar: "Madar Balance",
          card: "Card (Visa/Mastercard)"
        },
        addons: {
          vip: {
            title: "VIP Telegram (monthly)",
            subtitle: "Recurring monthly. Cancel anytime.",
            choose: "Add now"
          }
        },
        libyana: {
          title: "Pay with Libyana Balance",
          instructions: "Send the payment to the following number:",
          note: "After payment, your enrollment will be confirmed by our team."
        },
        madar: {
          title: "Pay with Madar Balance",
          instructions: "Send the payment to the following number:",
          note: "After payment, your enrollment will be confirmed by our team."
        },
        actions: {
          complete: "Complete Purchase",
          back: "Back"
        },
        summary: {
          title: "Order Summary",
          course: "Course",
          subtotal: "Subtotal",
          taxes: "Taxes",
          total: "Total"
        },
        benefits: {
          certificate: "You’ll receive a certificate of achievement",
          lifetime: "Lifetime access to all tiers",
          vipSignals: "+ our Telegram VIP signals group",
          brokerBonus: "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits"
        },
        modal: {
          title: "Payment Details",
          remaining: "Time remaining:",
          send_to: "Send USDT (TRC20) to:",
          amount: "Amount (approx):",
          txid_prompt: "Enter your transaction hash (TXID) after sending the USDT.",
          txid_ph: "Transaction hash",
          phone_prompt: "Enter the phone number you sent the balance from.",
          status: "Current status:",
          verifying: "We are verifying your transaction. This can take a few minutes.",
          awaiting: "Awaiting manual confirmation from admin. You will receive access once verified.",
          close: "Close",
          paid: "I've Paid"
        },
        promo : {
          not_applied: "This promo didn’t apply (invalid, expired, not applicable, or per-user limit).",
          applied: "This promo was applied successfully.",
          label: "Promo Code",
          placeholder: "Enter code (optional)",
          confirm: "Confirm Promo",
          due: "You pay:",
          saved: "saved"
        },
        errors: {
          txid_required: "Please enter the transaction hash",
          phone_required: "Please enter the sender phone number",
          proof_failed: "Failed to submit proof"
        }
      },
      celebration: {
        title: "Enrollment Confirmed!",
        body: "Congratulations, you're enrolled into {{course_name}} successfully.",
        cta_hint: "Click below to get started on your path to mastering trading.",
        cta: "Go to My Guides",
        vip_ready: "VIP unlocked. Join via Telegram:",
        vip_join: "Open VIP Telegram",
        vip_offer: "Add VIP Telegram monthly subscription now:",
        vip_subscribe: "Subscribe to VIP"
      },
      // NEW: unified keys referenced by ContentAdmin
      common: {
        select: 'Select',
        save: 'Save',
        // aliases used in admin communications panel
        showAll: 'Show all',
        refresh: 'Refresh',
        reviews: 'Reviews',
        noMessages: 'No messages found',
        no_messages: 'No messages found',
        phone: 'Phone',
        copy: 'Copy',
        download_qr: 'Download QR',
        email: 'Email',
        products: 'Products',
        only_unread: 'Unread',
        show_all: 'Show all',
        export_csv: 'Export CSV',
        course: 'Course',
        message: 'Message',
        meta: 'Metadata',
        page: 'Page',
        reply: 'Reply',
        whatsapp: 'WhatsApp',
        show: 'Show',
        create: 'Create',
        delete: 'Delete',
        confirm: 'Confirm',
        reject: 'Reject',
        upload: 'Upload',
        hide: 'Hide',
        loading: 'Loading...',
        prev: 'Previous',
        next: 'Next',
        click_to_load: 'Click to load',
        video: 'Video',
        price: 'Price',
        price_usdt: 'Price (USDT)',
        price_stripe: 'Price (Stripe cents)',
        currency: 'Currency',
        expires_at: 'Expires at',
        title: 'Title',
        subtitle: 'Subtitle',
        note: 'Note',
        close: 'Close',
        name: 'Name',
        origin: 'Origin',
        destination: 'Destination',
        airline: 'Airline',
        image_url: 'Image URL',
        expires_in: 'Expires in',
        select_image: 'Select image…',
        preview: 'preview',
        forbidden: 'Forbidden', // used as fallback in ContentAdmin
        copied: 'Copied',
        got_it: 'Got it, thanks!',
      },
      instructor: {
        name: 'Instructor Name',
        avatar_url: 'Avatar URL',
        bio: 'Instructor Bio',
        upload_photo: 'Upload Instructor Photo',
      },
      course: {
        level: {
          beginner: 'BEGINNER',
          intermediate: 'INTERMEDIATE',
          advanced: 'ADVANCED'
        }
      },
      social: {
        telegram_embed: 'Telegram embed URL',
        telegram_join: 'Telegram join URL',
        discord_widget: 'Discord widget ID',
        discord_invite: 'Discord invite URL',
        twitter_timeline: 'X/Twitter timeline URL'
      },
      materials: {
        title: 'Materials',
        load: 'Load Materials',
        upload_pdf: 'Upload PDF',
        upload_video: 'Upload Video',
        none: 'No materials loaded. Click "Load Materials".',
        staged_title: 'Materials (staged)',
        add_pdfs: 'Add PDFs',
        add_videos: 'Add Videos',
        files_selected: '{{count}} file(s) selected',
        staged_note: 'These will be uploaded and attached after you click Create.'
      },
      admin: {
        title: 'Admin Dashboard',
        communications: 'Communications',
        jobs: 'Jobs',
        applications: 'Applications',
        promos: 'Promos',
        progress: 'Progress',
        prizes: 'Prizes',
        comm: {
          search_ph: 'Search name, email, message…',
          status_read: 'READ',
          status_open: 'OPEN',
          mark_unread: 'Mark unread',
          mark_read: 'Mark read',
          ticket_id: 'Ticket',
        },
        content: 'Content',
        admin_overview: 'Admin Overview',
        pending_transactions: 'Pending Transactions',
        banners: 'Banners',
        trailer_url: 'Trailer URL',
        revenue_over_time: 'Revenue Over Time',
        traffic_conversions: 'Traffic & Conversions',
        purchase_status_breakdown: 'Purchase Status Breakdown',
        revenue_split: 'Revenue Split',
        top_courses_revenue: 'Top Guides by Revenue',
        course_views_sales: 'Course Views vs Sales',
        preview_url: 'Preview URL',
        upload_trailer: 'Upload Trailer (video)',
        upload_preview: 'Upload Preview (video)',
        course_tiers: 'Course Tiers',
        subtitle: 'Manage verifications and discovery content',
        quick_actions: 'Quick Actions',
        verifications: 'Verifications',
        analytics: 'Analytics',
        create_content: 'Create Content',
        create_banner: 'Create New',
        pending_users: 'Pending Users',
        pending_businesses: 'Pending Businesses',
        pending_payments: "Pending Payments",
        pending_usdt: "Pending USDT",
        pending_balance: "Pending Balance",
        overview: 'Overview',
        view: 'View',
        must_be_admin: 'You must be an admin to view this page.'
      },
      header: {
        hi: 'Hi, {{name}}',
        dashboard: 'Dashboard',
        path: 'My Path',
        account: 'My account',
        cart: 'Cart',
        emptyCart: 'Empty Cart',
        clearCart: 'Clear Cart',
      },
      dashboard: {
        title: 'Dashboard',
        communications: "Communications",
        admin: 'Admin',
        subtitle: 'Manage your courses and account',
        available: 'Available',
        pending_transactions: 'Pending Transactions',
        active_learning: 'Active Learning',
        overview: 'Overview',
        courses: 'My Guides',
        all_time: 'All Time',
        total_revenue: 'Total Revenue',
        users: 'Users',
        site_views: 'Site Views',
        sessions_purchase: 'Sessions → Purchase',
        session_conversion: 'Session conversion',
        signup_buyer: 'Signup → Buyer',
        lead_conversion: 'Lead conversion',
        arpu_aov: 'ARPU / AOV',
        avg_rev_user_aov: 'Avg Rev/User • AOV',
        usdt_stripe: 'USDT + Stripe',
        pending_over_time: 'Pending Over Time',
        purchase_id: 'ID',
        user: 'User',
        tier: 'Tier',
        pending: 'PENDING',
        proof: 'Proof',
        id: 'ID',
        email: 'Email',
        name: 'Name',
        account: 'Account',
        purchases: 'Purchases',
        settings: 'Settings',
        language: 'Language',
        total_courses: 'Total Guides',
        enrolled: 'Enrolled',
        no_courses: 'You are not enrolled in any courses yet.',
        continue: 'Continue',
        no_purchases: 'No purchases yet.',
        open: 'Open',
        settings_hint: 'Use the header controls to switch language. More settings coming soon.',
        vip_title: 'VIP Telegram',
        vip_status_active: 'Status: Active',
        vip_status_inactive: 'Not subscribed.',
        vip_join: 'Open VIP Telegram',
        empty: "No courses yet."
      },
      progress: {
        title: 'My Progress',
        overview: 'Overview',
        badges: 'Badges',
        leaderboard: 'Leaderboard',
        level: 'Level',
        xp: 'XP',
        streak: 'Streak',
        days: 'days',
        courses_completed: 'Guides Completed',
        total_xp: 'Total XP',
        xp_to_next_level: 'XP to next level',
        days_in_a_row: 'days in a row',
        out_of: 'out of',
        course_progress: 'Course Progress',
        complete: 'complete',
        lessons: 'lessons',
        videos: 'videos',
        pdfs: 'PDFs',
        completed: 'Completed',
        in_progress: 'In Progress',
        not_started: 'Not Started',
        keep_learning: 'Keep Learning!',
        great_progress: 'Great progress! Keep it up!',
        xp_earned: 'XP earned',
        progress_saved: 'Progress Saved!',
        badge_unlocked: 'Badge Unlocked!',
        new_level: 'Level Up!',
        reached_level: 'You reached level {{level}}!',
      },
      badges: {
        title: 'Badges',
        my_badges: 'My Badges',
        all_badges: 'All Badges',
        unlocked: 'Unlocked',
        locked: 'Locked',
        no_badges_yet: 'No badges unlocked yet',
        complete_lessons: 'Complete lessons and courses to earn badges!',
        rarity: {
          common: 'Common',
          rare: 'Rare',
          epic: 'Epic',
          legendary: 'Legendary',
        },
        category: {
          milestone: 'Milestone',
          achievement: 'Achievement',
          streak: 'Streak',
          special: 'Special',
        },
        unlock_progress: 'Unlock Progress',
        unlocked_at: 'Unlocked',
      },
      leaderboard: {
        title: 'Leaderboard',
        top_students: 'Top Students',
        rank: 'Rank',
        student: 'Student',
        level: 'Level',
        xp: 'XP',
        you: 'You',
        top_3: 'Top 3',
      },
      errors: {
        load_failed: "Failed to load Guides"
      },
      levels: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced"
      },
      price: {
        usd: "USD {{value}}",
        usdt: "USDT {{value}}"
      },
      learn: {
        loading: "Loading course...",
        course_fallback: "Course",
        actions: {
        my_courses: "My Guides",
        mark_completed: "I'm done"
        },
        completion: {
          marked: "Marked as Completed"
        },
        instructor: {
          title: "Instructor"
        },
        materials: {
          title: "Course Materials",
          preview: "Preview Video",
          trailer: "Trailer",
          telegram: "Telegram Group",
          discord: "Discord",
          twitter: "Twitter",
          empty: "No materials published yet."
        },
        reviews: {
          title: "Reviews",
          loading: "Loading reviews…",
          leave: "Leave a review",
          submit: "Submit Review",
          rating_required: "Rating required",
          thanks: "Thank you for your review!",
          submit_failed: "Failed to submit review",

          comment_placeholder: "Write your review here...",
          verified: "Verified",
          empty: "No reviews yet.",
        },
        documents: {
          title: "Documents",
          loading: "Loading document…"
        },
        certificate: {
          get: "Get Certificate",
          share: "Share Certificate",
          download: "Download Certificate",
          copy: "Copy Link",
          copied: "Copied Link",
          preview: "Preview Certificate"
        },
        videos: {
          title: "Videos"
        },
        chart: {
          title: "Live Chart Practice",
          description: "Practice reading charts in real-time. Use the tools below to analyze price action, identify patterns, and apply what you've learned.",
          tip: "💡 Tip: Try different timeframes and symbols to practice your analysis skills"
        },
        guard: {
          note: "Downloads are disabled. Screenshots are discouraged."
        },
        support: {
          title: "Need help?",
          body: "If you believe this access is in error, contact support and include your purchase ID."
        },
        access: {
          title: "Course Access",
          denied_fallback: "You do not have access to this course.",
          back_to_my_courses: "Back to My Guides"
        },
        errors: {
          access_denied: "Access denied. You must be enrolled to view this course.",
          load_failed: "Failed to load course",
          complete_failed: "Failed to mark course as completed"
        },
        watermark: {
          user: "User: {{user}}"
        },
        capture: {
          title: "Screenshot blocked",
          body: "For your privacy and to protect this course, screenshots and captures are restricted.",
          pfp_blocked: "Screenshot blocked"
        },
        forex: {
          title: "What is Forex?",
          subtitle: "Currencies trade in pairs. Buy one, sell the other — on the spot.",
          points: {
            spot: "Spot only: instant exchange (no delays).",
            no_riba: "No interest/swaps (no riba).",
            ecn: "Use ECN brokers — you own your position digitally.",
            gharar: "Learn basics and decide clearly to reduce uncertainty."
          }
        },
        crypto: {
          title: "What is Crypto?",
          subtitle: "Digital assets on blockchains. Trade and transfer peer-to-peer.",
          points: {
            ownership: "Buy the asset directly; avoid interest-bearing products.",
            no_interest: "No interest (riba).",
            education: "Limit gharar: understand risks and trade thoughtfully."
          }
        },
        disclaimer: "Halal when: spot settlement, no riba, and speculation is minimized.",
        disclaimer_short: "Permissible when avoiding riba/maysir and minimizing gharar.",
      },
      contact: {
        title: "Contact Us",
        subtitle: "Send us a message and we will get back to you shortly.",
        name: "Your Name",
        name_ph: "John Doe",
        basic_info: "Basic information",
        phone_info: "Phone (optional)",
        details: "Details",
        email: "Email",
        email_ph: "you@example.com",
        course: "Course (optional)",
        course_ph: "Select a course",
        course_fallback: "Course",
        message: "Message",
        message_ph: "Tell us more about what you need...",
        send: "Send Message",
        sent: "Your message has been sent. We will get back to you soon.",
        error_send: "Failed to send message",
        validation_required: "Please fill all required fields.",
        alt: "Prefer WhatsApp or Telegram?",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        default_text: "Hello, I would like to know more about your Guides.",
        course_id: "Course ID",
        toast_sent_title: "Message sent",
        toast_sent_desc: "We will get back to you shortly."
      },
      lead: {
         title: "promrkts Trader’s 3-Step Halal Checklist",
        subtitle: "Plus: an instant lesson and weekly setups.",
        cta: "Join",
        placeholder: "Enter your email address",
        name: "Your Name",
        phone: "Phone",
        email: "Email",
        name_required: 'Please enter your name.',
        email_invalid: 'Please enter a valid email.',
        phone_invalid: 'Please enter a valid phone number.',
        success: 'Thank you for your interest!',
        error: 'Something went wrong. Please try again.',
      },
      home: {
        powered: {
          badge: "Powered by AI",
          learning: "Personalized learning & coaching",
          reasoning: "Signal reasoning & journaling",
          languages: "FR • AR • EN"
        },
        offers: 'Limited-time Offers',
        badge: { exclusive: 'Exclusive' },
        trip_type: 'Trip type',
        enroll: 'Enroll',
        stats: {
          students: "Learners coached",
          profitability: "Report improved consistency"
        },
        class: 'Class',
        remove_segment: 'Remove',
        multi_validation: 'Please fill all multi-city segment fields',
        search_validation: 'Please provide origin, destination, and departure date',
        searching: 'Searching...',
        form_note: 'Free cancellations on selected fares',
        trust_line: 'Trusted by travelers worldwide • Premium support 24/7',
        search: 'Search',
        hero: {
          title: 'Your partners in success.',
          subtitle: 'Join +4,200 learners making real profit in around 4 weeks.',
          cta_primary: 'Start Learning Now',
          welcome: 'Hello, {{name}}',
          welcome_sub: 'Pick up where you left off — your Guides, tools, and community await.',
          cta_secondary: 'View Course Details',
          vip_title: 'VIP Telegram',
          days_remaining: 'Days remaining',
          days: 'days',
          open_telegram: 'Open Telegram',
          enrolled_courses: 'Your Guides',
          courses_enrolled: 'Guides enrolled',
          recent_courses: 'Your recent guides',
        },
        time: {
          days_short: 'd',
          hours_short: 'h',
          minutes_short: 'm',
          seconds_short: 's',
        },
        urgency: {
          kicker: "Course enrollment closes in",
          enroll: "Enroll Now",
          talk: "Talk to an Advisor"
        },
        promo: {
          kicker: "Limited-time course promo:",
          copy: "Copy",
          details: "Save up to 10% — apply this code at checkout before the timer ends.",
          kicker_late: "Missed your chance?",
          details_late: "Use this late access code."

        },
        trustpilot: {
          title: "Loved for the coaching — trusted for the reasoning",
          badge: "Trustpilot Verified",
          headline1: "Trustpilot Verified",
          ratingText1: "Excellent • 4.8 out of 5",
          reviewsCount1: "1,200+ reviews",
          proofText1: "Real students. Real outcomes.",
          headline2: "Highly Rated by Learners",
          ratingText2: "4.9/5 Average Instructor Rating",
          reviewsCount2: "Top 1% in category",
          proofText2: "Independently verified feedback.",
          headline3: "Trusted in MENA & Beyond",
          ratingText3: "Global community of learners",
          reviewsCount3: "Growing every week",
          proofText3: "Transparency you can count on."
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Find quick answers below. Still stuck? Reach out — we're happy to help.",
          q1: "Who are these programs for?",
          a1: "Beginners to advanced learners looking for structured, outcome-focused training.",
          q2: "How are the guides delivered?",
          a2: "Live cohorts and self-paced modules with community support and downloadable resources.",
          q3: "Do I get a certificate?",
          a3: "Yes, you'll receive a certificate of completion you can share on LinkedIn.",
          q4: "Can I try before committing?",
          a4: "We offer previews and sample lessons so you can explore before you enroll.",
          items: [
            { q: "Who are these programs for?", a: "Beginners to advanced learners looking for structured, outcome-focused training." },
            { q: "How are the guides delivered?", a: "Live cohorts and self-paced modules with community support and downloadable resources." },
            { q: "Do I get a certificate?", a: "Yes, you'll receive a certificate of completion you can share on LinkedIn." },
            { q: "Can I try before committing?", a: "We offer previews and sample lessons so you can explore before you enroll." }
          ]
        },
        benefits: {
          title: 'Experience a Unique Learning Journey',
          one: 'Expert-Led Curriculum',
          one_desc: 'Structured paths from fundamentals to advanced strategies.',
          two: 'Actionable Lessons',
          two_desc: 'Projects and case studies designed for real outcomes.',
          three: 'Premium Community',
          three_desc: 'Access mentorship, events and private channels.',
          four: 'Shariah-compliant',
          four_desc: 'All guides teach Shariah-compliant trading.',
        },
        features: {
          title: 'What Makes Our Programs Unique',
          one: 'Foundations to Mastery',
          one_desc: 'From basics to advanced methodology in a clear track.',
          two: 'Cohort-Based Learning',
          two_desc: 'Learn with peers, guided by instructors.',
          three: 'Resources Library',
          three_desc: 'Templates, checklists and downloads included.',
          four: 'Certificate',
          four_desc: 'Showcase your achievement upon graduation.',
        },
        courses: {
          title: 'Our services',
          cta: 'Join',
          view: 'View',
          access: 'Access',
          no_courses: 'No guides available',
          no_subscriptions: 'No subscriptions available',
        },
        cta: {
          kicker: 'Ready to Learn?',
          title: 'Start Your Learning Journey Today',
          subtitle: 'Join learners globally and access our premium course library.',
          primary: 'Browse Guides',
          secondary: 'Contact Us',
          image_alt: 'Start trading — premium education for every level',
        },
        enrolled: {
          markets_title: "Markets Overview",
          markets_sub: "Live charts + adaptive watchlists personalized to you",
          markets_tab_fx: 'Forex',
          markets_tab_cr: 'Crypto',
          tips_title: 'Tips & Tricks',
          tip1: 'Use a risk-reward of at least 1:2.',
          tip2: 'Wait for candle close; avoid chasing wicks.',
          tip3: 'Mark HTF S/R weekly and daily.',
          tip4: 'Keep a journal and tag setups.',
          tip5: 'Focus on a handful of pairs to master flow.',
          tip6: 'Avoid trading around high-impact news unless planned.',
          badge: 'Learning Dashboard',
          headline: 'Welcome back — your progress, in one place.',
          subheadline:
            'Track your guides, monitor the markets, and stay on top of the latest news.',
          cta_primary: 'Continue where you left off',
          cta_secondary: 'View all programs',
          courses_title: 'Continue Learning',
          no_courses: 'No active guides yet.',
          news_title: 'Market News & Updates',
          news_helper:
            'Macro, FX and crypto stories that matter for your sessions.',
          badges_title: 'Badges & Achievements',
          offers_title: 'Personalized Offers & Discounts',
          offers_helper: 'Tailored based on your enrollment and interests',
          broker_title: 'Trade With Our Preferred Broker',
          broker_sub: 'Tight spreads, ECN execution, and fast withdrawals.',
          broker_cta: 'Join Our Broker',
          progress_complete: 'complete',
          progress_not_started: 'Not started yet',
        },
      },
      token: {
        loadingPortfolio: "Loading portfolio…",

        hero: {
          title: "The Desk Token for Traders",
          sub: "Built to power the Trading Floor experience: perks, rewards, and community access — with compliance-first rollout."
        },

        landing: {
          plannedBadge: "{{symbol}} (Planned)",
          enterTradingFloor: "Enter Trading Floor",
          explore: "Explore",
          buyTokens: "Buy Tokens",
          totalSupply: "Total supply: {{total}}",
          complianceNote:
            "This page is product/roadmap information only. It is not financial advice, not an offer to sell, and all terms may change subject to legal/compliance review."
        },

        chart: {
          title: "Market Chart",
          loading: "Loading chart…",
          noData: "No data yet.",
          tf1m: "1m",
          tf5m: "5m",
          tf15m: "15m",
          tf1h: "1h"
        },

        metrics: {
          title: "Token Snapshot",
          sub: "Simple, transparent initial parameters for the planned rollout.",
          initialPrice: "Initial Price",
          onlyPair: "Trading Pair",
          lock: "Staking Lock",
          lockValue: "{{months}} months"
        },

        utilities: {
          title: "Utilities (Planned)",
          sub: "Designed to improve learning outcomes and community accountability.",
          items: {
            "Trading Floor Access": {
              title: "Trading Floor Access",
              body: "Unlock Discord floor rooms, live reviews, and role-based channels."
            },
            "Community Rewards": {
              title: "Community Rewards",
              body: "Planned rewards model for activity, learning streaks, and performance reviews (subject to policy)."
            },
            "Staking (Locked)": {
              title: "Staking (Locked)",
              body: "Planned staking lock: 12 months from stake date. Terms may evolve with compliance."
            },
            "Guides + Communities Boost": {
              title: "Guides + Communities Boost",
              body: "Discounts, early access, and perks across Guides and Communities (planned)."
            }
          }
        },

        dist: {
          title: "Distribution (Draft)",
          sub: "A transparent draft allocation model. Final allocations may change with compliance.",
          items: {
            "Community Rewards": {
              label: "Community Rewards",
              note: "Planned incentives & engagement"
            },
            "Liquidity & Market Making": {
              label: "Liquidity & Market Making",
              note: "Single initial pair (planned)"
            },
            "Treasury / Ecosystem": {
              label: "Treasury / Ecosystem",
              note: "Growth, partnerships, ops"
            },
            "Team (Vested)": {
              label: "Team (Vested)",
              note: "Long-term alignment (planned vesting)"
            },
            "Advisors / Partners": {
              label: "Advisors / Partners",
              note: "Strategic expansion"
            }
          },
          footnote: "* Distribution shown is a draft for UI/roadmap context only."
        },

        cta: {
          title: "Get started",
          sub: "Buy tokens to unlock benefits and participate in the profit-share pool.",
          buyTokens: "Buy Tokens",
          enterDiscord: "Enter Discord"
        },

        holdings: {
          title: "{{symbol}} Holdings",
          poolShare: "Pool share:",
          tokensOwned: "Tokens owned",
          positionValue: "Position value",
          unlockDate: "Unlock date",
          lockedNote: "Locked until unlock date",
          lockedUntil: "Locked until {{date}}",
          earnedEstimate: "Earned (est.)",
          earnedFormula: "Estimated using {{pct}}% profit share",
          purchasesTitle: "Purchases",
          purchaseLine: "{{tokens}} tokens • USDT due: {{usdt}}",
          marketBuy: "Market Buy",
          marketSell: "Market Sell",
          enterTradingFloor: "Enter Trading Floor"
        },

        order: {
          usdt: "USDT",
          price: "Price",
          tokens: "Tokens",
          buy: "Buy",
          sell: "Sell",
          buyLower: "buy",
          sellLower: "sell",
          buyTitle: "Buy {{symbol}}",
          sellTitle: "Sell {{symbol}}",
          buySubmitted: "Buy order submitted",
          sellSubmitted: "Sell order submitted",
          orderFailed: "Order failed",
          marketNote: "Market orders execute at the best available price.",
          inputTokens: "Tokens",
          inputUsdt: "USDT",
          tokensPlaceholder: "Enter token amount",
          usdtPlaceholder: "Enter USDT amount",
          estimatedTokens: "Estimated tokens",
          estimatedValue: "Estimated value",
          maxSellable: "Max sellable: {{amount}} {{symbol}}",
          sellTooMuch: "You don’t have enough tokens to sell that amount.",
          confirmTitle: "Confirm {{side}}",
          confirmDesc: "Please confirm you want to {{side}} at market price.",
          usdtEst: "Estimated USDT",
          confirmBtn: "Confirm {{side}}"
        },

        unstake: {
          title: "Unstake",
          openBtn: "Unstake",
          available: "Available",
          lockedHoldings: "Locked holdings",
          unlockDate: "Unlock date:",
          earlyWarningShort: "Early unlock forfeits a fee.",
          modeNormal: "Normal",
          modeEarly: "Early",
          placeholder: "Amount to unstake",
          fee: "Fee",
          receive: "You receive",
          earlyForfeit: "Early unstake fee applies.",
          confirm: "Confirm",
          success: "Unstake submitted",
          failTitle: "Unstake failed"
        },

        wallet: {
          title: "Link USDT Wallet",
          trc20: "TRC20",
          erc20: "ERC20",
          placeholderTrc: "Enter TRC20 address",
          placeholderErc: "Enter ERC20 address",
          note: "Make sure your address matches the selected network.",
          success: "Wallet linked",
          failTitle: "Link failed"
        },

        walletCard: {
          title: "Wallet Overview",
          connectedWallet: "Connected Wallet",
          copied: "Copied address",
          loading: "Loading balances & prices…",
          noteMultiChain: "SOL/BTC balances are best-effort unless you store per-chain addresses for the user."
        }
      },
      broker: {
        partner_label: "Introducing Broker",
        anax_brand: "ANAX Capital",
        hero_title: "Trade with Our Preferred Broker",
        hero_subtitle:
          "Join our broker through our official IB link to align your trading conditions with the way we actually trade: tight spreads, fast execution and institutional-level support.",
        hero_point_1: "Regulated & trusted partner",
        hero_point_2: "Built for active traders",
        cta_primary: "Open Live Account via IB",
        cta_secondary: "Start with Demo",
        disclaimer_short:
          "Trading CFDs/FX is high risk. Only trade capital you can afford to lose.",
        metric_spreads: "Spreads from",
        metric_spreads_note: "On major FX pairs",
        metric_leverage: "Leverage up to",
        metric_leverage_note: "Varies by region & instrument",
        metric_execution: "Average execution",
        metric_execution_note: "Low-latency infrastructure",
        metric_platforms: "Platforms",
        metric_platforms_note: "Mobile & web",
        why_title: "Why join through our IB?",
        why_subtitle:
          "By registering through our official IB link, you help us negotiate better conditions with the broker and unlock extra perks aligned with the way we actually trade in promrkts.",
        benefit_spreads: "Institutional-style pricing",
        benefit_spreads_desc:
          "Tight spreads and competitive commissions suited for intraday & swing strategies we teach.",
        benefit_execution: "Fast execution & low latency",
        benefit_execution_desc:
          "Infrastructure optimised for fast order routing, so your fills match what we expect in the playbook.",
        benefit_alignment: "Aligned with our ecosystem",
        benefit_alignment_desc:
          "Educational flows, funding, and execution all line up. Less friction, more focus on trading.",
        steps_title: "How to join via our IB link",
        step_1: "Click the button below to open the broker sign-up page.",
        step_2: "Complete the registration form with your personal details.",
        step_3:
          "Optional: Notify support with your account number if you want us to double-check IB tagging.",
        cta_again: "Join Broker via promrkts",
        risk_title: "Risk disclosure (read this)",
        risk_1:
          "Trading foreign exchange (FX), CFDs and derivatives carries a high level of risk and may not be suitable for all investors.",
        risk_2:
          "You can lose more than your initial investment. Only trade with money you can afford to lose and consider independent financial advice.",
        risk_3:
          "By proceeding, you acknowledge you understand the risks involved and that we are acting as an introducing partner, not as your broker.",
        anax: {
          hero_badge: "ANAX Capital Financial Markets LLC",
          hero_intro:
            "ANAX Capital FM LLC is a Dubai-based prime broker, covering spot FX, OTC derivatives, exchange-traded derivatives, and global equities for eligible clients.",
          hero_intro_secondary:
            "The firm’s infrastructure, liquidity partners, and compliance discipline create institutional-grade execution for UAE-based and international traders.",
          cta_primary: "Start Trading",
          cta_secondary: "Try Free Demo",
          why_title: "Why Choose ANAX Capital in the UAE",
          why_intro:
            "ANAX delivers multi-asset access under one regulated umbrella.",
          why_intro_secondary:
            "You gain transparent execution, deep liquidity, and responsive coverage tailored to eligible retail and institutional clients.",
          features: {
            multi_market: {
              title: "Multi-Market Access Around the World",
              description:
                "Trade FX, metals, energies, indices, equities, futures, and more with aggregated liquidity and secure settlement.",
            },
            low_spreads: {
              title: "Low Spreads, Tailored Leverage & Zero Commission",
              description:
                "Competitive pricing with leverage calibrated to client classification—up to 1:400 for eligible clients—and zero commissions on most accounts.",
            },
            hassle_free: {
              title: "Hassle-Free Deposits & Withdrawals",
              description:
                "Banking rails across multiple jurisdictions help process funds—often within 24 hours—while maintaining strict security.",
            },
            support: {
              title: "24/7 Multilingual & Dedicated Support",
              description:
                "Specialists assist with onboarding, funding, and platforms at any hour so you can focus on execution.",
            },
          },
          platform_title: "Platform Experience",
          platforms: {
            mt5: {
              title: "MetaTrader 5 (MT5)",
              description:
                "Unified access to FX, shares, commodities, indices, and energies with advanced charting, EAs, and social trading.",
            },
            app: {
              title: "ANAX Trading App (Coming Soon)",
              description:
                "A proprietary mobile experience delivering fast execution, real-time data, and secure multi-device management.",
            },
            web: {
              title: "Web Trader",
              description:
                "Browser-based trading with institutional connectivity, advanced charting, and live market depth.",
            },
          },
          steps_title: "Start in 4 Easy Steps",
          steps: {
            register: {
              title: "Register",
              description: "Fill the simple online form to create your profile.",
            },
            verify: {
              title: "Verify",
              description: "Upload KYC documents to unlock live trading.",
            },
            fund: {
              title: "Fund",
              description: "Deposit capital once compliance approval is complete.",
            },
            trade: {
              title: "Trade",
              description: "Access 1,000+ instruments with institutional-grade execution.",
            },
          },
          support_title: "Enabling Confident & Informed Trading",
          support: {
            efficient_onboarding: "Efficient onboarding with rigorous KYC and compliance checks.",
            multilingual_support: "Multilingual support teams available around the clock.",
            education_demo: "Education resources and demo tools for every experience level.",
            secure_payments: "Secure payment channels with transparent processing timelines.",
          },
          disclaimer: {
            website:
              "Disclaimer: ANAX Capital Financial Markets LLC (SCA License No. 20200000258) provides execution-only services. Any materials provided are not investment advice and cannot be relied upon for investment decisions. Clients must conduct independent research and accept that ANAX Capital is not liable for losses or damages arising from use of such information. Trading leveraged products involves high risk, and losses may exceed deposits.",
            restricted_regions:
              "Restricted Regions Warning: ANAX Capital does not offer products or services to residents of Afghanistan, Congo, Haiti, Iran, Kenya, Lebanon, Libya, Mali, Myanmar, North Korea (DPRK), Russia, Somalia, South Sudan, Syria, Venezuela, Yemen, or any jurisdiction where such offerings would contravene local laws.",
            risk_warning:
              "Risk Warning: Trading financial products on margin carries a high level of risk and may not be suitable for all investors. Consider your objectives, risk tolerance, and experience before trading, and seek independent advice if needed. ANAX Capital provides execution-only services and is not responsible for trading outcomes.",
          },
        },
      },
      features: {
        title: 'Why Choose Us',
        pricing: {
          title: 'Best Price Guarantee',
          desc: "Find a lower price? We'll match it and give you an extra 5% off",
        },
        support: {
          title: '24/7 Premium Support',
          desc: 'Expert travel consultants available around the clock',
        }
      },
      footer: {
        tagline: 'Level up your skills with curated, hands-on guides.',
        rights: 'All rights reserved.',
        courses: 'Guides',
        popular: 'Popular',
        new: 'New & Trending',
        bundles: 'Bundles & Offers',
        about: 'About Us',
        careers: 'Careers',
        press: 'Press',
        support: 'Support',
        help: 'Help Center',
        contact: 'Contact Us',
        terms: 'Terms',
        connect: 'Connect',
        newsletter: 'Newsletter',
        social: 'Social Media',
        blog: 'Blog',
        learn: 'Learn',
        faq: 'FAQ',
        policy: 'Our Policy',
        resources: 'Resources',
        contact_us: 'Contact Us',
        company: 'Company',
        about_short: 'About',
      },
      auth: {
        login: 'Log in',
        login_title: 'Welcome back',
        login_subtitle: 'Access premium guides, curated signals and dedicated support',
        login_cta: 'Sign in',
        no_account: 'Don\'t have an account?',
        join_us: 'Join promrkts',
        login_loading: 'Signing you in…',
        login_error: 'Login failed',
        forgot_password: 'Forgot password?',
        create_account_sub: 'Access premium guides, curated signals and dedicated support',
        basic_info: 'Basic Information',
        contact_info: 'Contact Information',
        additional_info: 'Additional Information',
        remember_me: 'Remember me',

        register: 'Create account',
        register_title: 'Create your account',
        register_error: 'Registration failed',
        registering: 'Registering…',
        create_account: 'Create account',
        already_have: 'Already have an account?',
        have_account: 'Have an account?',

        name: 'Name',
        name_placeholder: 'Full name',
        email: 'Email',
        email_placeholder: 'you@example.com',
        password: 'Password',
        password_placeholder: '8+ characters',
        phone: 'Phone',
        phone_placeholder: 'Enter your number without country code',
        // register extras
        send_otp: 'Send OTP',
        otp_placeholder: 'Enter OTP',
        otp_sent: 'OTP sent. Please check your phone.',
        otp_verify_failed: 'Failed to verify OTP',
        verify: 'Verify',
        phone_verified: 'Phone verified.',
        open_whatsapp: 'Open WhatsApp',
        whatsapp_required: 'Your phone must be linked to WhatsApp to receive the OTP.',
        phone_required: 'Please enter your phone number.',
        phone_verify_required: 'Please verify your phone via OTP.',
        duplicate_email: 'Email already registered',
        error_underage: 'You must be at least 18 years old.',
        error_overage: 'Please enter a valid date of birth.',
        show: 'Show',
        nationality: 'Nationality',
        nationality_placeholder: 'e.g., Libya',
        hide: 'Hide',
        send_confirmation: 'Send confirmation email',
        email_sent: 'Email sent',
        email_code_placeholder: 'Enter 6-digit code',
        email_code_required: 'Enter the 6-digit code',
        verify_email: 'Verify',
        verify_email_title: 'Verify your email',
        verify_email_instructions: 'We sent a 6-digit code to your email. Please check your inbox and spam folder.',
        email_verified: 'Email verified',
        email_send_failed: 'Failed to send email',
        email_verify_failed: 'Failed to verify email',
        email_verify_required: 'Please verify your email.',
        resend_email: 'Resend',
        resend_in: 'Resend in',
        otp_required: 'Enter the OTP code.',
        otp_send_failed: 'Failed to send OTP',
        agree_required: 'You must accept the terms and disclaimer.',
        verified: 'Verified',
        accept_terms: 'I accept the Terms & Conditions',
        view_terms: 'View terms',
        accept_disclaimer: 'I accept the Disclaimer',
        view_disclaimer: 'View disclaimer',
        otp_via_whatsapp: 'OTP will be delivered via WhatsApp, not SMS.',

        account_type: 'Account type',
        personal_account: 'Personal',
        business_account: 'Business / Agency',

        dob: 'Date of birth',
        gender: 'Gender',
        gender_male: 'Male',
        gender_female: 'Female',
        gender_other: 'Other',

        // Forgot / reset password flow
        forgot_title: 'Forgot password',
        forgot_subtitle: 'Enter your email and we will send a password reset link.',
        forgot_cta: 'Send reset link',
        forgot_sent: 'Reset link sent',
        forgot_sent_desc: 'If that email exists, we sent a reset link. Check your inbox.',
        forgot_error: 'Failed to send reset link',
        email_required: 'Email required to resend link',

        reset_title: 'Reset password',
        reset_subtitle: 'Enter a new password for your account.',
        reset_cta: 'Reset password',
        reset_success: 'Password reset',
        reset_success_desc: 'Your password has been updated. Please sign in with your new password.',
        reset_error: 'Failed to reset password',

        reset_token: 'Reset token',
        reset_token_placeholder: 'Paste the token here if not using link',
        hide_token: 'Hide',
        enter_token: 'Enter token',
        using_link_token:
          'Using token from link — you can enter a different one manually below.',
        reset_token_expired_desc:
          'The reset token may be invalid or expired. You can request a new token below.',

        password_confirm: 'Confirm password',
        password_min: 'Password must be at least 8 characters',
        password_mismatch: 'Passwords do not match',
        no_token: 'Missing reset token',
      },
      tooltip: {
        lightMode: 'Switch to light mode',
        darkMode: 'Switch to dark mode',
        logout: 'Logout',
      },
      aria: {
        toggleTheme: 'Toggle theme',
        logout: 'Logout',
      }
    }
  },

  fr: {
    translation: {
      brand: 'promrkts',
      Forex_Gold_Indices: "Forex / Or / Indices",
      Crypto: "Crypto",
      All_Forex_Headlines: "Toutes les actualités Forex",
      Forex_Timeline: "Fil d’actualités Forex",
      Gold_XAUUSD_Headlines: "Actualités Or (XAUUSD)",
      Gold_Timeline: "Fil d’actualités Or",
      Indices_Headlines: "Actualités des Indices",
      Indices_Timeline: "Fil d’actualités Indices",
      All_Crypto_Headlines: "Toutes les actualités Crypto",
      Crypto_Timeline: "Fil d’actualités Crypto",
      token: {
        loadingPortfolio: "Chargement du portefeuille…",

        hero: {
          title: "Le token du desk pour traders",
          sub: "Conçu pour alimenter l’expérience Trading Floor : avantages, récompenses et accès communauté — avec un déploiement axé conformité."
        },

        landing: {
          plannedBadge: "{{symbol}} (Prévu)",
          enterTradingFloor: "Entrer sur Trading Floor",
          explore: "Explorer",
          buyTokens: "Acheter des tokens",
          totalSupply: "Offre totale : {{total}}",
          complianceNote:
            "Cette page est uniquement une information produit/feuille de route. Ce n’est pas un conseil financier, ni une offre de vente, et les conditions peuvent changer selon la revue légale/conformité."
        },

        chart: {
          title: "Graphique du marché",
          loading: "Chargement du graphique…",
          noData: "Pas encore de données.",
          tf1m: "1m",
          tf5m: "5m",
          tf15m: "15m",
          tf1h: "1h"
        },

        metrics: {
          title: "Aperçu du token",
          sub: "Paramètres initiaux simples et transparents pour le déploiement prévu.",
          initialPrice: "Prix initial",
          onlyPair: "Paire de trading",
          lock: "Blocage de staking",
          lockValue: "{{months}} mois"
        },

        utilities: {
          title: "Utilités (Prévu)",
          sub: "Conçu pour améliorer l’apprentissage et la responsabilité communautaire.",
          items: {
            "Trading Floor Access": {
              title: "Accès Trading Floor",
              body: "Débloquez des salons Discord, des revues en direct et des canaux par rôle."
            },
            "Community Rewards": {
              title: "Récompenses communauté",
              body: "Modèle de récompenses prévu pour l’activité, les streaks d’apprentissage et les revues de performance (selon la politique)."
            },
            "Staking (Locked)": {
              title: "Staking (bloqué)",
              body: "Blocage prévu : 12 mois à partir de la date de staking. Les conditions peuvent évoluer selon la conformité."
            },
            "Guides + Communities Boost": {
              title: "Boost Guides + Communautés",
              body: "Réductions, accès anticipé et avantages sur Guides et Communautés (prévu)."
            }
          }
        },

        dist: {
          title: "Distribution (Brouillon)",
          sub: "Un modèle d’allocation transparent (brouillon). Les allocations finales peuvent évoluer selon la conformité.",
          items: {
            "Community Rewards": {
              label: "Récompenses communauté",
              note: "Incentives et engagement prévus"
            },
            "Liquidity & Market Making": {
              label: "Liquidité & market making",
              note: "Une seule paire initiale (prévu)"
            },
            "Treasury / Ecosystem": {
              label: "Trésorerie / écosystème",
              note: "Croissance, partenariats, ops"
            },
            "Team (Vested)": {
              label: "Équipe (vesting)",
              note: "Alignement long terme (vesting prévu)"
            },
            "Advisors / Partners": {
              label: "Conseillers / partenaires",
              note: "Expansion stratégique"
            }
          },
          footnote: "* La distribution affichée est un brouillon à titre de contexte UI/roadmap uniquement."
        },

        cta: {
          title: "Commencer",
          sub: "Achetez des tokens pour débloquer des avantages et participer au pool de partage des profits.",
          buyTokens: "Acheter des tokens",
          enterDiscord: "Entrer sur Discord"
        },

        holdings: {
          title: "Avoirs {{symbol}}",
          poolShare: "Part du pool :",
          tokensOwned: "Tokens détenus",
          positionValue: "Valeur de la position",
          unlockDate: "Date de déverrouillage",
          lockedNote: "Bloqué jusqu’à la date de déverrouillage",
          lockedUntil: "Bloqué jusqu’au {{date}}",
          earnedEstimate: "Gains (est.)",
          earnedFormula: "Estimé avec {{pct}}% de partage des profits",
          purchasesTitle: "Achats",
          purchaseLine: "{{tokens}} tokens • USDT dû : {{usdt}}",
          marketBuy: "Achat marché",
          marketSell: "Vente marché",
          enterTradingFloor: "Entrer sur Trading Floor"
        },

        order: {
          usdt: "USDT",
          price: "Prix",
          tokens: "Tokens",
          buy: "Acheter",
          sell: "Vendre",
          buyLower: "acheter",
          sellLower: "vendre",
          buyTitle: "Acheter {{symbol}}",
          sellTitle: "Vendre {{symbol}}",
          buySubmitted: "Ordre d’achat envoyé",
          sellSubmitted: "Ordre de vente envoyé",
          orderFailed: "Échec de l’ordre",
          marketNote: "Les ordres au marché s’exécutent au meilleur prix disponible.",
          inputTokens: "Tokens",
          inputUsdt: "USDT",
          tokensPlaceholder: "Saisir un montant de tokens",
          usdtPlaceholder: "Saisir un montant en USDT",
          estimatedTokens: "Tokens estimés",
          estimatedValue: "Valeur estimée",
          maxSellable: "Max vendable : {{amount}} {{symbol}}",
          sellTooMuch: "Vous n’avez pas assez de tokens pour vendre ce montant.",
          confirmTitle: "Confirmer {{side}}",
          confirmDesc: "Veuillez confirmer que vous voulez {{side}} au prix du marché.",
          usdtEst: "USDT estimé",
          confirmBtn: "Confirmer {{side}}"
        },

        unstake: {
          title: "Unstake",
          openBtn: "Unstake",
          available: "Disponible",
          lockedHoldings: "Avoirs bloqués",
          unlockDate: "Date de déverrouillage :",
          earlyWarningShort: "Le déverrouillage anticipé applique des frais.",
          modeNormal: "Normal",
          modeEarly: "Anticipé",
          placeholder: "Montant à unstake",
          fee: "Frais",
          receive: "Vous recevez",
          earlyForfeit: "Des frais d’unstake anticipé s’appliquent.",
          confirm: "Confirmer",
          success: "Demande d’unstake envoyée",
          failTitle: "Échec de l’unstake"
        },

        wallet: {
          title: "Lier un portefeuille USDT",
          trc20: "TRC20",
          erc20: "ERC20",
          placeholderTrc: "Saisir l’adresse TRC20",
          placeholderErc: "Saisir l’adresse ERC20",
          note: "Vérifiez que l’adresse correspond au réseau sélectionné.",
          success: "Portefeuille lié",
          failTitle: "Échec de la liaison"
        },

        walletCard: {
          title: "Aperçu du portefeuille",
          connectedWallet: "Portefeuille connecté",
          copied: "Adresse copiée",
          loading: "Chargement des soldes et des prix…",
          noteMultiChain:
            "Les soldes SOL/BTC sont approximatifs sauf si vous stockez les adresses par chaîne pour l’utilisateur."
        }
      },
      ai: {
        coach: {
          title: "Rencontrez votre coach de trading IA",
          subtitle: "Leçons adaptatives, retours instantanés et simulations de stratégie personnalisées — disponibles 24h/24 en arabe, français et anglais.",
          card1: "Programme adaptatif",
          card1_desc: "Apprend votre style, vos forces et vos lacunes. Accélère les sujets difficiles et saute ceux déjà maîtrisés.",
          card2: "Simulation et débriefing",
          card2_desc: "Rejouez vos entrées, sorties et gestions. Recevez des critiques raisonnées, pas seulement des notes.",
          card3: "Conforme à la charia",
          card3_desc: "Règlement au comptant, sans riba, et risque réduit. Conseils clairs pour des méthodes conformes.",
          cta: {
            primary: "Essayer le coach IA",
            secondary: "Voir comment ça marche"
          }
        },
        how: {
          title: "Comment ça marche",
          step1: "Profil et objectifs",
          step1_desc: "Indiquez vos disponibilités, tolérance au risque et objectifs.",
          step2: "Leçons adaptatives",
          step2_desc: "Modules courts adaptés à votre rythme en AR/FR/EN.",
          step3: "Simulez et pratiquez",
          step3_desc: "Lancez des simulations de stratégie avec retours guidés.",
          step4: "Passer en réel (facultatif)",
          step4_desc: "Connectez-vous à des courtiers conformes et continuez à apprendre avec l’IA."
        }
      },
      powered: {
        badge: "Propulsé par l’IA",
        learning: "Apprentissage et coaching personnalisés",
        reasoning: "Analyse des signaux et journalisation",
        languages: "FR • AR • EN"
      },
      home_metrics: {
        active_programs_label: "Programmes actifs",
        active_programs_helper: "Actuellement en cours",
        streak_label: "Série d’apprentissage",
        days: "jours",
        streak_helper: "Maintenez la série pour débloquer des badges",
        hours_label: "Heures apprises",
        hrs: "h",
        hours_helper: "30 derniers jours (approx.)",
        completion_label: "Progression du parcours",
        completion_helper: "Sur l’ensemble de vos programmes actifs",
      },
      celebration: {
        title: "Inscription confirmée !",
        body: "Félicitations, vous êtes inscrit avec succès à {{course_name}}.",
        course_fallback: "Cours",
        cta_hint: "Cliquez ci-dessous pour démarrer votre parcours vers la maîtrise du trading.",
        shortcut: "Aller aux cours",
        vip_ready: "VIP activé",
        vip_ready_desc: "Rejoignez notre Telegram VIP pour accéder aux signaux, aux sessions en direct et au chat premium.",
        vip_join: "Ouvrir le Telegram VIP",
        vip_offer: "Ajoutez l’abonnement mensuel VIP dès maintenant :",
        vip_subscribe: "S’abonner au VIP",
        help: "Besoin d’aide ? Contactez la communauté à tout moment.",
        cta: "Aller à Mes cours",
      },      
      nav: {
        search: 'Rechercher',
        enrolled: 'Enrolled',
        signIn: 'Se connecter',
        signOut: 'Se déconnecter',
        contact: 'Contact',
      },
      crypto: {
        title: "Guide USDT",
        subtitle: "Un guide concis et fiable pour acheter, envoyer et vérifier l’USDT en toute sécurité.",
        what_is_usdt: {
          title: "Qu’est-ce que l’USDT ?",
          desc: "USDT (Tether) est une cryptomonnaie stable conçue pour refléter la valeur du dollar américain sur plusieurs blockchains."
        },
        note_stablecoin: "L’USDT est un stablecoin conçu pour suivre le dollar américain (1 USDT ≈ 1 $).",
        chains: {
          title: "Réseaux compatibles avec l’USDT",
          desc: "USDT existe sur plusieurs blockchains. Les frais et vitesses varient selon le réseau.",
          erc20: "Largement supporté, mais frais élevés en période de congestion.",
          bep20: "Frais inférieurs à ERC20 ; compatible avec les portefeuilles BNB Smart Chain.",
          trc20: "Généralement le plus économique et le plus rapide pour les transferts d’USDT."
        },
        fees_tip: "Astuce : TRC20 est généralement le plus économique et le plus rapide pour les transferts USDT.",
        buy: {
          title: "Comment acheter de l’USDT",
          desc: "Choisissez une plateforme réputée ou un vendeur local vérifié.",
          global_title: "Plateformes mondiales",
          libya_title: "Acheter en Libye",
          libya_desc: "Utilisez des plateformes fiables ou des bureaux de change bien notés."
        },
        kyc_warning: "Utilisez des vendeurs vérifiés et complétez la vérification d’identité (KYC) si nécessaire. Évitez le P2P sans escrow.",
        send: {
          title: "Comment envoyer de l’USDT",
          desc: "Vérifiez toujours l’adresse du portefeuille et le réseau avant l’envoi.",
          steps: {
            1: "Copiez exactement l’adresse du destinataire.",
            2: "Sélectionnez le bon réseau (p. ex., TRC20).",
            3: "Envoyez d’abord un petit test pour confirmer.",
            4: "Envoyez le montant total une fois confirmé."
          }
        },
        txn: {
          title: "Exemple de hash de transaction",
          desc: "Voici à quoi peut ressembler l’identifiant (hash) d’une transaction blockchain.",
          note: "Vous pouvez suivre ce hash sur un explorateur blockchain public."
        },
        network_match_tip: "Faites toujours correspondre le réseau côté expéditeur et destinataire (ex. TRC20 ↔ TRC20).",
        guide: {
          quick: {
            title: "Guide rapide : acheter → définir le réseau → envoyer → confirmer",
            buy: "Achetez de l’USDT sur une plateforme ou auprès d’un vendeur vérifié.",
            network: "Choisissez TRC20 sauf indication contraire pour les frais/la vitesse.",
            verify: "Collez l’adresse, vérifiez les 4 premiers/derniers caractères, envoyez un test de 1 $ puis le montant total."
          }
        },
        faq: {
          title: "FAQ",
          network_wrong: {
            q: "Et si je choisis le mauvais réseau ?",
            a: "Les fonds peuvent être perdus. Confirmez toujours le réseau avec le destinataire avant l’envoi."
          },
          fees: {
            q: "Pourquoi ai-je reçu moins ?",
            a: "Les plateformes et réseaux facturent des frais. Envoyez un peu plus ou anticipez les frais."
          }
        },
        video: {
          title: "Guide vidéo : Acheter et envoyer de l’USDT (TRC20)",
          desc: "Regardez ce tutoriel pas à pas pour acheter de l’USDT (TRC20) et l’envoyer en toute sécurité.",
          url: ""
        },
        cta_enroll: "S’inscrire maintenant",
        cta_disclaimer: "Contenu éducatif uniquement. Ceci n’est pas un conseil financier."
      },
      actions: {
        refresh: "Actualiser",
        confirm: "Confirmer",
        view_details: "Voir les détails",
        enroll: "S’inscrire",
        fail: "Échouer",
        crypto_guide: "Guide des cryptos",
        verify: "Vérifier"
      },
      notes: {
        usdt_trc20: "Tous les dépôts USDT doivent être envoyés via le réseau TRC20 (TRON).",
        network_reminder: "Utilisez le réseau TRC20 pour les paiements USDT."
      },
      sections: {
        pending_payments: "Paiements en attente",
        pending_users: "Utilisateurs en attente",
        pending_businesses: "Entreprises en attente"
      },
      statuses: {
        pending: "En attente",
        confirmed: "Confirmé",
        failed: "Échoué"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "Utilisateur : {{name}} ({{email}})",
        course_line: "Cours : {{course}}",
        proof_line: "Preuve : {{hash}}",
        created_at: "Créé : {{date}}",
        owner_line: "Propriétaire : {{owner}}",
        yes: "Oui",
        no: "Non",
        na: "s.o."
      },
      empty_states: {
        no_pending_payments: "Aucun paiement en attente.",
        no_pending_users: "Aucun utilisateur en attente.",
        no_pending_businesses: "Aucune entreprise en attente."
      },
      forbidden: {
        title: "Interdit",
        message: "Vous devez être administrateur pour consulter cette page."
      },
      common: {
        select: "Sélectionner",
        save: "Enregistrer",
        delete: "Supprimer",
        anonymous: "Apprenant",
        // aliases used in admin communications panel
        showAll: 'Tous les messages',
        only_unread: 'Seulement les messages non lus',
        noMessages: 'Aucun message trouvé',
        reviews: 'Aucun message trouvé',
        copy: 'Copier',
        download_qr: 'Télécharger QR',
        refresh: 'Actualiser',
        no_messages: 'Aucun message trouvé',
        show_all: 'Tous les messages',
        products: 'Produits',
        export_csv: 'Exporter en CSV',
        phone: 'Téléphone',
        email: 'Email',
        course: 'Cours',
        message: 'Message',
        meta: 'Metadata',
        page: 'Page',
        reply: 'Répondre',
        whatsapp: 'WhatsApp',
        show: "Afficher",
        create: "Créer",
        confirm: 'Confirmer',
        reject: 'Rejeter',
        upload: "Téléverser",
        loading: 'Chargement...',
        price: "Prix",
        price_usdt: "Prix (USDT)",
        price_stripe: "Prix (Stripe, centimes)",
        currency: "Devise",
        expires_at: "Expire le",
        prev: "Précédent",
        next: "Suivant",
        click_to_load: "Cliquer pour charger",
        video: "Vidéo",
        title: "Titre",
        subtitle: "Sous-titre",
        note: "Remarque",
        close: "Fermer",
        name: "Nom",
        origin: "Origine",
        destination: "Destination",
        airline: "Compagnie aérienne",
        image_url: "URL de l’image",
        expires_in: "Expire dans",
        select_image: "Sélectionner une image…",
        preview: "aperçu",
        forbidden: 'Interdit',
        copied: 'Copié',
        got_it: 'Compris, merci!',
      },
      instructor: {
        name: "Nom du formateur",
        avatar_url: "URL de l’avatar",
        bio: "Bio du formateur",
        upload_photo: "Téléverser la photo du formateur",
      },
      course: {
        level: {
          beginner: 'DÉBUTANT',
          intermediate: 'INTERMÉDIAIRE',
          advanced: 'AVANCÉ'
        }
      },
      social: {
        telegram_embed: "URL d’intégration Telegram",
        telegram_join: "URL d’invitation Telegram",
        discord_widget: "ID du widget Discord",
        discord_invite: "URL d’invitation Discord",
        twitter_timeline: "URL du fil X/Twitter"
      },
      materials: {
        title: "Ressources",
        load: "Charger les ressources",
        upload_pdf: "Téléverser un PDF",
        upload_video: "Téléverser une vidéo",
        none: "Aucune ressource chargée. Cliquez sur « Charger les ressources ».",
        staged_title: "Ressources (en attente)",
        add_pdfs: "Ajouter des PDF",
        add_videos: "Ajouter des vidéos",
        files_selected: "{{count}} fichier(s) sélectionné(s)",
        staged_note: "Elles seront téléversées et rattachées après avoir cliqué sur Créer."
      },
      admin: {
        title: 'Tableau de bord',
        content: 'Contenu',
        banners: 'Bannières',
        jobs: 'Postes vacants',
        applications: 'Postulants',
        progress: 'Progression',
        prizes: 'Prix',
        communications: 'Communications',
        promos: 'Promos',
        badge_stats: {
          title: 'Statistiques des Badges',
          total_badges: 'Total des Badges',
          most_popular: 'Le Plus Populaire',
          rarest: 'Le Plus Rare',
          students: 'étudiants',
          available: 'Disponible à débloquer',
          unlock_stats: 'Statistiques de Déblocage',
        },
        comm: {
          search_ph: 'Rechercher nom, e-mail, message…',
          status_read: 'LU',
          status_open: 'OUVERT',
          mark_unread: 'Marquer comme non lu',
          mark_read: 'Marquer comme lu',
          ticket_id: 'Ticket',
        },
        admin_overview: 'Vue d’ensemble',
        pending_transactions: 'Transactions en attente',
        trailer_url: 'URL de la bande-annonce',
        revenue_over_time: 'Revenus dans le temps',
        traffic_conversions: 'Trafic & conversions',
        purchase_status_breakdown: 'Répartition des statuts d’achats',
        revenue_split: 'Répartition des revenus',
        top_courses_revenue: 'Meilleurs cours par revenus',
        course_views_sales: 'Vues du cours vs ventes',
        preview_url: 'URL de l’aperçu',
        upload_trailer: 'Téléverser la bande-annonce (vidéo)',
        upload_preview: 'Téléverser l’aperçu (vidéo)',
        course_tiers: 'Paliers de cours',
        subtitle: 'Gérez les vérifications et le contenu de découverte',
        quick_actions: 'Actions rapides',
        verifications: 'Vérifications',
        analytics: 'Analytics',
        create_content: 'Créer du contenu',
        create_banner: 'Créer une bannière',
        pending_users: 'Utilisateurs en attente',
        pending_businesses: 'Entreprises en attente',
        pending_payments: "Paiements en attente",
        pending_usdt: "USDT en attente",
        pending_balance: "Solde en attente",
        overview: 'Aperçu',
        view: 'Voir',
        must_be_admin: "Vous devez être administrateur pour consulter cette page."
      },
      contact: {
        title: "Contactez-nous",
        subtitle: "Envoyez-nous un message et nous vous recontacterons bientôt.",
        name: "Nom",
        name_ph: "Nom complet",
        basic_info: "Informations de base",
        phone_info: "Numéro de téléphone (facultatif)",
        email: "Email",
        email_ph: "you@example.com",
        course: "Cours (facultatif)",
        course_ph: "Sélectionner un cours",
        course_fallback: "Cours",
        message: "Message",
        message_ph: "Dites-nous plus sur ce que vous avez besoin...",
        send: "Envoyer le message",
        sent: "Votre message a été envoyé. Nous vous recontacterons bientôt.",
        error_send: "Échec de l'envoi du message",
        validation_required: "Veuillez remplir tous les champs obligatoires.",
        alt: "Préférez WhatsApp ou Telegram ?",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        default_text: "Bonjour, j'aimerais savoir plus sur vos cours.",
        course_id: "ID du cours",
        toast_sent_title: "Message envoyé",
        toast_sent_desc: "Nous vous recontacterons bientôt.",
      },
      progress: {
        title: 'Ma Progression',
        overview: 'Aperçu',
        badges: 'Badges',
        leaderboard: 'Classement',
        level: 'Niveau',
        xp: 'XP',
        streak: 'Série',
        days: 'jours',
        courses_completed: 'Cours Terminés',
        total_xp: 'XP Total',
        xp_to_next_level: 'XP au prochain niveau',
        days_in_a_row: 'jours d\'affilée',
        out_of: 'sur',
        course_progress: 'Progression du Cours',
        complete: 'terminé',
        lessons: 'leçons',
        videos: 'vidéos',
        pdfs: 'PDFs',
        completed: 'Terminé',
        in_progress: 'En Cours',
        not_started: 'Pas Commencé',
        keep_learning: 'Continuez!',
        great_progress: 'Excellent progrès! Continuez!',
        xp_earned: 'XP gagné',
        progress_saved: 'Progression Sauvegardée!',
        badge_unlocked: 'Badge Débloqué!',
        new_level: 'Niveau Supérieur!',
        reached_level: 'Vous avez atteint le niveau {{level}}!',
      },
      badges: {
        title: 'Badges',
        my_badges: 'Mes Badges',
        all_badges: 'Tous les Badges',
        unlocked: 'Débloqué',
        locked: 'Verrouillé',
        no_badges_yet: 'Aucun badge débloqué',
        complete_lessons: 'Complétez des leçons pour gagner des badges!',
        rarity: {
          common: 'Commun',
          rare: 'Rare',
          epic: 'Épique',
          legendary: 'Légendaire',
        },
        category: {
          milestone: 'Étape',
          achievement: 'Réussite',
          streak: 'Série',
          special: 'Spécial',
        },
        unlock_progress: 'Progression de Déverrouillage',
        unlocked_at: 'Débloqué',
      },
      leaderboard: {
        title: 'Classement',
        subtitle: 'Découvrez qui mène la voie vers la maîtrise du trading',
        top_students: 'Meilleurs Étudiants',
        rank: 'Rang',
        student: 'Étudiant',
        level: 'Niveau',
        xp: 'XP',
        you: 'Vous',
        top_3: 'Top 3',
        how_to_compete: 'Comment Participer',
        loading: 'Chargement...',
        no_data: 'Aucune donnée disponible',
        onboarding: {
          title: 'Grimpez dans le Classement!',
          description: 'Rivalisez avec d\'autres étudiants et gagnez votre place au sommet! Voici comment gagner de l\'XP et grimper dans les rangs:',
          watch_videos: 'Regarder des Vidéos',
          watch_videos_desc: 'Complétez des leçons vidéo pour gagner de l\'expérience',
          read_pdfs: 'Lire des PDFs',
          read_pdfs_desc: 'Étudiez les supports de cours et les ressources',
          complete_lessons: 'Terminer des Leçons',
          complete_lessons_desc: 'Terminez des leçons entières pour monter de niveau plus rapidement',
          complete_courses: 'Terminer des Cours',
          complete_courses_desc: 'Terminez des cours complets pour des boosts d\'XP massifs',
          maintain_streak: 'Maintenez Votre Série',
          maintain_streak_desc: 'Apprenez chaque jour pour gagner des bonus de série',
          pro_tip: 'Conseil Pro:',
          pro_tip_desc: 'Débloquez des badges en atteignant des jalons! Les badges mettent en valeur vos réalisations et votre dévouement. Consultez votre page de progression pour voir quels badges vous pouvez débloquer ensuite.',
          view_progress: 'Voir Ma Progression',
          get_started: 'Commencer',
        },
      },
      dashboard: {
        title: 'Tableau de bord',
        subtitle: 'Gérez vos cours et votre compte',
        overview: 'Aperçu',
        available: 'Disponible',
        pending_transactions: 'Transactions en attente',
        active_learning: 'Apprendre Actif',
        courses: 'Mes cours',
        admin: 'Admin',
        total_revenue: 'Revenu total',
        all_time: 'Tout le temps',
        users: 'Utilisateurs',
        site_views: 'Vues du site',
        sessions_purchase: 'Sessions → Achat',
        session_conversion: 'Conversion des sessions',
        signup_buyer: 'Inscription → Acheteur',
        lead_conversion: 'Conversion des leads',
        arpu_aov: 'ARPU / AOV',
        avg_rev_user_aov: 'Revenu moyen/utilisateur • AOV',
        usdt_stripe: 'USDT + Stripe',
        pending_over_time: 'Évolutions des en attentes',
        purchase_id: 'ID',
        user: 'Utilisateur',
        tier: 'Palier',
        pending: 'EN ATTENTE',
        proof: 'Preuve',
        id: 'ID',
        email: 'E-mail',
        name: 'Nom',
        account: 'Compte',
        purchases: 'Achats',
        settings: 'Paramètres',
        language: 'Langue',
        total_courses: 'Nombre de cours',
        enrolled: 'Inscrit',
        no_courses: "Vous n'êtes inscrit à aucun cours.",
        continue: 'Continuer',
        no_purchases: "Aucun achat pour le moment.",
        open: 'Ouvrir',
        settings_hint: 'Use the header controls to switch language. More settings coming soon.',
        vip_title: 'VIP Telegram',
        vip_status_active: 'Active',
        vip_status_inactive: 'Non abonné.',
        vip_join: 'Ouvrir Telegram VIP',
        vip_started: 'Commencé',
        vip_renews: 'Renouvelle',
        vip_subscribe: 'Souscrire',
        vip_renew: 'Renouveler la souscription',
        vip_days_left: 'Jours restants',
      },
      admin_legacy: { // keep your original FR admin dashboard copy block for safety
        title: 'Tableau de bord',
        content: 'Contenu',
        banners: 'Bannières',
        subtitle: 'Gérez vos cours et votre compte',
        overview: 'Aperçu',
        courses: 'Mes cours',
        account: 'Compte',
        purchases: 'Achats',
        settings: 'Paramètres',
        total_courses: 'Nombre de cours',
        enrolled: 'Inscrit',
        no_courses: "Vous n'êtes inscrit à aucun cours.",
        continue: 'Continuer',
        no_purchases: "Aucun achat pour le moment.",
        open: 'Ouvrir',
        settings_hint: "Utilisez l’en-tête pour changer la langue. D’autres réglages arrivent."
      },
      learn: {
        loading: "Chargement du cours…",
        course_fallback: "Cours",
        actions: {
          my_courses: "Mes cours",
          mark_completed: "J'ai fini"
        },
        forex: {
          title: "Qu’est-ce que le Forex ?",
          subtitle: "Les devises se négocient par paires. Achat de l’une, vente de l’autre — au comptant.",
          points: {
            spot: "Au comptant uniquement : échange immédiat.",
            no_riba: "Sans intérêt / swaps (pas de riba).",
            ecn: "Courtier ECN : vous détenez votre position numériquement.",
            gharar: "Réduisez l’incertitude (gharar) : base solide, décision claire."
          }
        },
        crypto: {
          title: "Qu’est-ce que la crypto ?",
          subtitle: "Actifs numériques sur des blockchains. Échanges pair-à-pair.",
          points: {
            ownership: "Acheter l’actif directement ; éviter les produits porteurs d’intérêt.",
            no_interest: "Sans intérêt (riba).",
            education: "Limiter le gharar : comprendre les risques et agir avec mesure."
          }
        },
        disclaimer: "Halal si au comptant, sans riba, et spéculation minimisée.",
        disclaimer_short: "Permis en évitant riba/maysir et en minimisant le gharar.",
        completion: {
          marked: "Marqué comme terminé"
        },
        instructor: {
          title: "Formateur"
        },
        certificate: {
          get: "Obtenir le certificat",
          share: "Partager le certificat",
          download: "Télécharger le certificat",
          copy: "Copier le lien",
          copied: "Lien copié",
          preview: "Aperçu"
        },
        materials: {
          title: "Ressources du cours",
          preview: "Vidéo d’aperçu",
          trailer: "Bande-annonce",
          telegram: "Groupe Telegram",
          discord: "Discord",
          twitter: "Twitter",
          empty: "Aucune ressource publiée pour le moment."
        },
        reviews: {
          title: "Avis",
          loading: "Chargement des avis…",
          leave: "Laisser un avis",
          submit: "Soumettre l'avis",
          rating_required: "Note requise",
          thanks: "Merci pour votre avis!",
          submit_failed: "Échec de la soumission de l'avis",
          comment_placeholder: "Écrivez votre avis ici...",
          verified: "Vérifié",
          empty: "Aucun avis pour le moment."
        },
        documents: {
          title: "Documents",
          loading: "Chargement du document…"
        },
        videos: {
          title: "Vidéos"
        },
        chart: {
          title: "Pratique de Graphiques en Direct",
          description: "Pratiquez la lecture de graphiques en temps réel. Utilisez les outils ci-dessous pour analyser l'action des prix, identifier les modèles et appliquer ce que vous avez appris.",
          tip: "💡 Astuce: Essayez différentes périodes et symboles pour pratiquer vos compétences d'analyse"
        },
        guard: {
          note: "Le téléchargement est désactivé. Les captures d’écran sont déconseillées."
        },
        support: {
          title: "Besoin d’aide ?",
          body: "Si cet accès vous paraît erroné, contactez le support et joignez votre identifiant d’achat."
        },
        access: {
          title: "Accès au cours",
          denied_fallback: "Vous n’avez pas accès à ce cours.",
          back_to_my_courses: "Retour à Mes cours"
        },
        errors: {
          access_denied: "Accès refusé. Vous devez être inscrit pour voir ce cours.",
          load_failed: "Échec du chargement du cours",
          complete_failed: "Échec de la marquage du cours comme terminé"
        },
        watermark: {
          user: "Utilisateur : {{user}}"
        },
        capture: {
          title: "Capture d’écran bloquée",
          body: "Pour votre confidentialité et la protection du cours, les captures et enregistrements sont restreints.",
          pfp_blocked: "Capture bloquée"
        }
      },
      lead: {
        title: "Checklist halal du trader IA en 3 étapes",
        subtitle: "Et recevez une leçon IA instantanée et des configurations hebdomadaires.",
        cta: "S'inscrire",
        placeholder: "Entrez votre adresse e-mail",
        name: "Votre nom",
        phone: "Téléphone",
        email: "E-mail",
        name_required: 'Veuillez entrer votre nom.',
        email_invalid: 'Veuillez entrer une adresse e-mail valide.',
        phone_invalid: 'Veuillez entrer un numéro de téléphone valide.',
        success: "Merci pour votre intérêt !",
        error: "Une erreur s'est produite. Veuillez réessayer.",
      },
      home: {
        spin_and_win: 'Spin & Win',
        hero: {
          title: 'Devenez un trader expert avec les meilleurs.',
          subtitle: 'Rejoignez des +4,200 d\'apprenants.',
          cta_primary: 'Commencer la formation',
          welcome: 'Bienvenue, {{name}}',
          welcome_sub: 'Reprenez là où vous vous êtes arrêté — vos cours, outils et communauté vous attendent.',
          recent_courses: 'Vos cours récents',
          cta_secondary: 'Voir',
          vip_title: 'VIP Telegram',
          days_remaining: 'Jours restants',
          days: 'jours',
          open_telegram: 'Ouvrir Telegram',
          enrolled_courses: 'Vos Cours',
          courses_enrolled: 'cours inscrits',
        },
        time: {
          days_short: 'j',
          hours_short: 'h',
          minutes_short: 'm',
          seconds_short: 's',
        },
        powered: {
          badge: "Powered by AI",
          learning: "Personalized learning & coaching",
          reasoning: "Signal reasoning & journaling",
          languages: "FR • AR • EN",
        },
        enrolled: {
          markets_title: "Aperçu des marchés optimisé par l’IA",
          markets_sub: "Graphiques en direct et listes de suivi adaptées à votre profil",
          markets_tab_fx: "Forex",
          markets_tab_cr: "Crypto",
          tips_title: "Astuces & Conseils",
          tip1: "Utilisez un ratio risque/rendement d’au moins 1:2.",
          enroll: "S’inscrire maintenant",
          talk: "Parler à un conseiller"
        },
        promo: {
          kicker: "Promo cours limitée :",
          copy: "Copier",
          details: "Économisez jusqu’à 10 % — appliquez ce code au paiement avant la fin du temps.",
          kicker_late: "Promo accès tardif :",
          details_late: "Missed your chance? Use this late access code."
        },
        trustpilot: {
          title: "Apprécié pour le coaching — reconnu pour l’analyse",
          badge: "Vérifié par Trustpilot",
          headline1: "Vérifié par Trustpilot",
          ratingText1: "Excellent • 4,8 sur 5",
          reviewsCount1: "Plus de 1 200 avis",
          proofText1: "De vrais étudiants. De vrais résultats.",
          headline2: "Hautement apprécié par les apprenants",
          ratingText2: "4,9/5 Note moyenne des formateurs",
          reviewsCount2: "Top 1 % de la catégorie",
          proofText2: "Avis vérifiés de manière indépendante.",
          headline3: "Fiable au Moyen-Orient",
          ratingText3: "Communauté mondiale d’apprenants",
          reviewsCount3: "En croissance chaque semaine",
          proofText3: "Une transparence sur laquelle vous pouvez compter."
        },
        faq: {
          title: "Questions Fréquemment Posées",
          subtitle: "Trouvez des réponses rapides ci-dessous. Encore des doutes ? Contactez-nous — nous serons ravis de vous aider.",
          items: [
            { "q": "À qui s’adressent ces programmes ?", "a": "Aux débutants comme aux apprenants avancés cherchant une formation structurée et axée sur les résultats." },
            { "q": "Comment les cours sont-ils dispensés ?", "a": "Par des cohortes en direct et des modules en autonomie avec un soutien communautaire et des ressources téléchargeables." },
            { "q": "Est-ce que je reçois un certificat ?", "a": "Oui, vous recevrez un certificat d’achèvement que vous pourrez partager sur LinkedIn." },
            { "q": "Puis-je essayer avant de m’engager ?", "a": "Nous proposons des aperçus et des leçons d’essai afin que vous puissiez explorer avant de vous inscrire." }
          ]
        },
        benefits: {
          title: 'Vivez une expérience d’apprentissage luxueuse',
          one: 'Programme dirigé par des experts',
          one_desc: 'Des parcours structurés, des bases aux stratégies avancées.',
          two: 'Leçons concrètes',
          two_desc: 'Projets et études de cas pour des résultats réels.',
          three: 'Communauté premium',
          three_desc: 'Mentorat, événements et espaces privés.',
          four: 'Conformité Shariah',
          four_desc: 'Toutes les leçons enseignent des stratégies conformes au Shariah.',
        },
        features: {
          title: 'Ce qui rend nos programmes d’élite',
          one: 'Des fondations à la maîtrise',
          one_desc: 'Un parcours clair jusqu’aux méthodologies avancées.',
          two: 'Apprentissage en cohorte',
          two_desc: 'Apprenez avec vos pairs, guidés par des formateurs.',
          three: 'Bibliothèque de ressources',
          three_desc: 'Modèles, checklists et téléchargements inclus.',
          four: 'Certificat',
          four_desc: 'Valorisez votre accomplissement après le cursus.',
        },
        courses: {
          title: 'Nos services',
          cta: 'Rejoindre',
          view: 'Voir',
          access: 'Accéder',
        },
        cta: {
          kicker: 'Prêt à apprendre ?',
          title: 'Commencez votre parcours dès aujourd’hui',
          subtitle: 'Rejoignez des apprenants dans le monde entier et accédez à notre bibliothèque premium.',
          primary: 'Parcourir les cours',
          secondary: 'Contactez-nous',
        },
      },
      broker: {
        partner_label: "Courtier introducteur",
        anax_brand: "ANAX Capital",
        hero_title: "Tradez avec notre courtier partenaire",
        hero_subtitle:
          "Rejoignez notre courtier via notre lien IB officiel pour aligner vos conditions de trading sur notre façon réelle de trader : spreads serrés, exécution rapide et support de niveau institutionnel.",
        hero_point_1: "Partenaire régulé et de confiance",
        hero_point_2: "Conçu pour les traders actifs",
        cta_primary: "Ouvrir un compte réel via l’IB",
        cta_secondary: "Commencer avec un compte démo",
        disclaimer_short:
          "Le trading de CFDs/Forex est très risqué. Ne tradez que de l’argent que vous pouvez vous permettre de perdre.",
        metric_spreads: "Spreads à partir de",
        metric_spreads_note: "Sur les principales paires FX",
        metric_leverage: "Effet de levier jusqu’à",
        metric_leverage_note: "Varie selon la région et l’instrument",
        metric_execution: "Exécution moyenne",
        metric_execution_note: "Infrastructure à faible latence",
        metric_platforms: "Plateformes",
        metric_platforms_note: "Mobile & web",
        why_title: "Pourquoi rejoindre ce courtier via notre IB ?",
        why_subtitle:
          "En vous inscrivant via notre lien IB officiel, vous nous aidez à négocier de meilleures conditions avec le courtier et à débloquer des avantages supplémentaires alignés sur la façon dont nous tradons dans promrkts.",
        benefit_spreads: "Tarification de style institutionnel",
        benefit_spreads_desc:
          "Spreads serrés et commissions compétitives adaptés aux stratégies intraday & swing que nous enseignons.",
        benefit_execution: "Exécution rapide et faible latence",
        benefit_execution_desc:
          "Infrastructure optimisée pour un routage rapide des ordres, afin que vos exécutions correspondent à ce que nous attendons dans le playbook.",
        benefit_alignment: "Aligné avec notre écosystème",
        benefit_alignment_desc:
          "Éducation, financement et exécution fonctionnent ensemble. Moins de friction, plus de focus sur le trading.",
        steps_title: "Comment rejoindre via notre lien IB",
        step_1: "Cliquez sur le bouton ci-dessous pour ouvrir la page d’inscription du courtier.",
        step_2: "Remplissez le formulaire d’inscription avec vos informations personnelles.",
        step_3:
          "Optionnel : prévenez le support avec votre numéro de compte si vous souhaitez que nous vérifiions le marquage IB.",
        cta_again: "Rejoindre le courtier via promrkts",
        risk_title: "Avertissement de risque (à lire)",
        risk_1:
          "Le trading de devises (FX), CFDs et dérivés comporte un niveau de risque élevé et peut ne pas convenir à tous les investisseurs.",
        risk_2:
          "Vous pouvez perdre plus que votre investissement initial. Ne tradez qu’avec de l’argent que vous pouvez vous permettre de perdre et envisagez un avis financier indépendant.",
        risk_3:
          "En continuant, vous reconnaissez comprendre les risques impliqués et que nous agissons comme partenaire introducteur, et non comme votre courtier.",
        anax: {
          hero_badge: "ANAX Capital Financial Markets LLC",
          hero_intro:
            "ANAX Capital FM LLC est un courtier multi-actifs basé à Dubaï, couvrant le FX, les dérivés OTC, les dérivés listés et les actions mondiales pour les clients admissibles.",
          hero_intro_secondary:
            "Son infrastructure, ses partenaires de liquidité et sa discipline de conformité offrent une exécution de niveau institutionnel pour les traders basés aux Émirats et à l’international.",
          cta_primary: "Commencer à trader",
          cta_secondary: "Essayer un compte démo",
          why_title: "Pourquoi choisir ANAX Capital aux Émirats",
          why_intro:
            "ANAX offre un accès multi-actifs sous un seul cadre réglementé.",
          why_intro_secondary:
            "Vous bénéficiez d’une exécution transparente, d’une liquidité profonde et d’un accompagnement adapté aux clients particuliers et institutionnels admissibles.",
          features: {
            multi_market: {
              title: "Accès multi-marchés dans le monde",
              description:
                "Tradez le FX, les métaux, l’énergie, les indices, les actions, les futures et plus encore avec une liquidité agrégée et un règlement sécurisé.",
            },
            low_spreads: {
              title: "Spreads bas, levier adapté et zéro commission",
              description:
                "Tarification compétitive avec un levier ajusté au profil client—jusqu’à 1:400 pour les clients admissibles—et zéro commission sur la plupart des comptes.",
            },
            hassle_free: {
              title: "Dépôts et retraits simplifiés",
              description:
                "Des rails bancaires internationaux accélèrent le traitement des fonds—souvent en moins de 24 h—tout en conservant un niveau de sécurité élevé.",
            },
            support: {
              title: "Support dédié 24/7 et multilingue",
              description:
                "Des spécialistes vous assistent pour l’onboarding, le financement et les plateformes afin que vous restiez concentré sur l’exécution.",
            },
          },
          platform_title: "Expérience plateforme",
          platforms: {
            mt5: {
              title: "MetaTrader 5 (MT5)",
              description:
                "Accès unifié au FX, aux actions, aux matières premières, aux indices et aux énergies avec graphiques avancés, EAs et social trading.",
            },
            app: {
              title: "Application ANAX (bientôt)",
              description:
                "Une application mobile propriétaire offrant exécution rapide, données temps réel et gestion sécurisée multi-appareils.",
            },
            web: {
              title: "Web Trader",
              description:
                "Négociez depuis votre navigateur avec connectivité institutionnelle, graphiques avancés et profondeur de marché en direct.",
            },
          },
          steps_title: "Démarrez en 4 étapes",
          steps: {
            register: {
              title: "Inscription",
              description: "Remplissez le formulaire en ligne pour créer votre profil.",
            },
            verify: {
              title: "Vérification",
              description: "Téléchargez vos documents KYC pour activer le trading réel.",
            },
            fund: {
              title: "Alimentation",
              description: "Déposez des fonds dès que la conformité valide votre dossier.",
            },
            trade: {
              title: "Trader",
              description: "Accédez à plus de 1 000 instruments avec une exécution institutionnelle.",
            },
          },
          support_title: "Permettre un trading confiant et informé",
          support: {
            efficient_onboarding: "Onboarding efficace avec contrôles KYC rigoureux.",
            multilingual_support: "Équipes d’assistance multilingues disponibles 24/7.",
            education_demo: "Ressources pédagogiques et comptes démo pour tous les niveaux.",
            secure_payments: "Canaux de paiement sécurisés et délais transparents.",
          },
          disclaimer: {
            website:
              "Avertissement : ANAX Capital Financial Markets LLC (licence SCA n° 20200000258) fournit uniquement des services d’exécution. Les informations reçues ne constituent pas des conseils en investissement. Les clients doivent effectuer leurs propres recherches et acceptent qu’ANAX Capital ne soit pas responsable des pertes. Le trading sur produits à effet de levier comporte un risque élevé et peut dépasser le capital investi.",
            restricted_regions:
              "Avertissement régions restreintes : ANAX Capital n’offre pas ses services aux résidents d’Afghanistan, Congo, Haïti, Iran, Kenya, Liban, Libye, Mali, Myanmar, Corée du Nord, Russie, Somalie, Soudan du Sud, Syrie, Venezuela, Yémen ou de toute juridiction où l’offre serait contraire aux lois locales.",
            risk_warning:
              "Avertissement de risque : Le trading de produits sur marge comporte un risque élevé et peut ne pas convenir à tous les investisseurs. Considérez vos objectifs, votre tolérance au risque et votre expérience avant de trader, et demandez conseil si nécessaire. ANAX Capital n’offre qu’un service d’exécution et n’est pas responsable des résultats de trading.",
          },
        },
      },
      title: "Cours de trading",
      states: {
        loading: "Chargement…",
        empty: "Aucun cours pour le moment."
      },
      errors: {
        load_failed: "Échec du chargement des cours"
      },
      levels: {
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé"
      },
      price: {
        usd: "USD {{value}}",
        usdt: "USDT {{value}}"
      },
      checkout: {
        title: "Paiement",
        subtitle: "Validez votre inscription avec des moyens de paiement rapides et flexibles.",
        free: "Gratuit",
        no_tier: "Aucun niveau de cours sélectionné. Revenez en arrière et choisissez un cours.",
        customer: {
          details: "Informations client",
          full_name: "Nom complet",
          email: "E-mail",
          country: "Pays/Région",
          pref_lang: "Langue du cours préférée"
        },
        lang: { "en": "Anglais", "ar": "Arabe", "fr": "Français" },
        placeholders: {
          name: "Votre nom",
          country: "Choisir un pays"
        },
        payment: {
          title: "Moyen de paiement",
          usdt: "USDT (TRC20)",
          libyana: "Solde Libyana",
          madar: "Solde Madar"
        },
        libyana: {
          title: "Payer avec le solde Libyana",
          instructions: "Envoyez le paiement au numéro suivant :",
          note: "Après le paiement, votre inscription sera confirmée par notre équipe."
        },
        madar: {
          title: "Payer avec le solde Madar",
          instructions: "Envoyez le paiement au numéro suivant :",
          note: "Après le paiement, votre inscription sera confirmée par notre équipe."
        },
        actions: {
          complete: "Finaliser l’achat",
          back: "Retour"
        },
        summary: {
          title: "Récapitulatif de la commande",
          course: "Cours",
          subtotal: "Sous-total",
          taxes: "Taxes",
          total: "Total"
        },
        benefits: {
          certificate: "Vous recevrez un certificat de réussite",
          lifetime: "Accès à vie à tous les niveaux",
          vipSignals: "+ notre groupe VIP de signaux Telegram",
          brokerBonus: "Rejoignez notre courtier certifié et profitez d’un bonus gratuit de 50–100 % sur vos dépôts"
        },
        modal: {
          title: "Détails du paiement",
          remaining: "Temps restant :",
          send_to: "Envoyez l’USDT (TRC20) à :",
          amount: "Montant (approx.) :",
          txid_prompt: "Saisissez le hash de transaction (TXID) après l’envoi de l’USDT.",
          txid_ph: "Hash de transaction",
          phone_prompt: "Saisissez le numéro de téléphone depuis lequel vous avez envoyé le solde.",
          status: "Statut actuel :",
          verifying: "Nous vérifions votre transaction. Cela peut prendre quelques minutes.",
          awaiting: "En attente d’une confirmation manuelle par un administrateur. Vous recevrez l’accès une fois vérifié.",
          close: "Fermer",
          paid: "J’ai payé"
        },
        addons: {
          vip: {
            title: "VIP Telegram (mensuelle)",
            subtitle: "Abonnement mensuel. Annulez à tout moment.",
            choose: "Ajouter (mensuelle)"
          }
        },
        errors: {
          txid_required: "Veuillez saisir le hash de transaction",
          phone_required: "Veuillez saisir le numéro de téléphone de l’expéditeur",
          proof_failed: "Échec de l’envoi de la preuve"
        }
      },
      footer: {
        tagline: "Améliorez vos compétences avec des cours pratiques et sélectionnés.",
        rights: "Tous droits réservés.",
        courses: "Cours",
        popular: "Populaire",
        new: "Nouveaux et tendances",
        bundles: "Packs et offres",
        about: "À propos",
        careers: "Carrières",
        press: "Presse",
        support: "Support",
        help: "Centre d'aide",
        contact: "Nous contacter",
        terms: "Conditions",
        connect: "Réseaux",
        newsletter: "Newsletter",
        social: "Réseaux sociaux",
        blog: "Blog",
        learn: "Apprendre",
        contact_us: "Nous contacter",
        faq: "FAQ",
        policy: "Politique de promrkts",
        resources: "Ressources",
        company: "Entreprise",
        about_short: "À propos",
      },
      auth: {
        login: 'Se connecter',
        login_title: 'Bienvenue',
        login_subtitle: 'Accédez à des cours premium, à des signaux sélectionnés et à un support dédié',
        login_cta: 'Se connecter',
         no_account: 'Vous n\'avez pas de compte ?',
        join_us: 'Rejoignez promrkts',
        login_loading: 'Connexion…',
        login_error: 'Échec de la connexion',
        verify: 'Vérifier',
        open_whatsapp: 'Ouvrir WhatsApp',
        whatsapp_required: 'Votre numéro de téléphone doit être lié à WhatsApp pour recevoir le OTP.',
        forgot_password: 'Mot de passe oublié ?',
        create_account_sub: "Accédez à des cours premium, à des signaux sélectionnés et à un support dédié",
        basic_info: "Informations de base",
        contact_info: "Informations de contact",
        additional_info: "Informations supplémentaires",
        remember_me: 'Se souvenir de moi',
        register: 'Créer un compte',
        register_title: 'Créez votre compte',
        register_error: 'Échec de l’inscription',
        registering: 'Inscription…',
        create_account: 'Créer le compte',
        already_have: 'Vous avez déjà un compte ?',
        have_account: 'Vous avez un compte ?',

        name: 'Nom',
        name_placeholder: 'Nom complet',
        email: 'E-mail',
        email_placeholder: 'vous@exemple.com',
        password: 'Mot de passe',
        password_placeholder: '8+ caractères',
        phone: 'Téléphone',
        phone_placeholder: 'Enter your number without country code',
        // register extras
        send_otp: 'Envoyer le code',
        otp_placeholder: 'Saisir le code',
        otp_sent: 'Code envoyé. Vérifiez votre téléphone.',
        otp_verify_failed: "Échec de la vérification du code",
        phone_verified: 'Téléphone vérifié.',
        phone_required: 'Veuillez saisir votre numéro de téléphone.',
        phone_verify_required: 'Veuillez vérifier votre téléphone via un code.',
        duplicate_email: 'E-mail déjà enregistré',
        error_underage: 'Vous devez avoir au moins 18 ans.',
        error_overage: 'Veuillez saisir une date de naissance valide.',
        show: 'Afficher',
        hide: 'Masquer',
        accept_terms: "J'accepte les Conditions générales",
        view_terms: 'Voir les conditions',
        accept_disclaimer: "J'accepte la clause de non-responsabilité",
        view_disclaimer: 'Voir l’avertissement',
        otp_via_whatsapp: 'Le code sera envoyé via WhatsApp, pas par SMS.',
        verified: 'Vérifié',
        send_confirmation: 'Envoyer l\'e-mail de confirmation',
        email_sent: 'E-mail envoyé',
        email_code_placeholder: 'Entrez le code à 6 chiffres',
        email_code_required: 'Entrez le code à 6 chiffres',
        verify_email: 'Vérifier',
        verify_email_title: 'Vérifiez votre e-mail',
        verify_email_instructions: 'Nous avons envoyé un code à 6 chiffres à votre e-mail. Veuillez vérifier votre boîte de réception et vos spams.',
        email_verified: 'E-mail vérifié',
        email_send_failed: 'Échec de l\'envoi de l\'e-mail',
        email_verify_failed: 'Échec de la vérification de l\'e-mail',
        email_verify_required: 'Veuillez vérifier votre e-mail.',
        resend_email: 'Renvoyer',
        resend_in: 'Renvoyer dans',
        otp_required: 'Entrez le code OTP.',
        otp_send_failed: 'Échec de l\'envoi du code',
        agree_required: 'Vous devez accepter les conditions et l\'avertissement.',

        account_type: 'Type de compte',
        personal_account: 'Personnel',
        nationality: 'Nationalité',
        nationality_placeholder: 'e.g., Libya',
        business_account: 'Entreprise / Agence',
        dob: 'Date de naissance',
        dob_placeholder: 'Date de naissance',
        gender: 'Genre',
        gender_placeholder: 'Genre',
        gender_male: 'Masculin',
        gender_female: 'Feminin',

        // Forgot / reset password flow
        forgot_title: 'Mot de passe oublié',
        forgot_subtitle:
          "Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation du mot de passe.",
        forgot_cta: 'Envoyer le lien',
        forgot_sent: 'Lien de réinitialisation envoyé',
        forgot_sent_desc:
          "Si cet e-mail existe, nous avons envoyé un lien de réinitialisation. Vérifiez votre boîte de réception.",
        forgot_error: "Échec de l'envoi du lien de réinitialisation",
        email_required: "L'e-mail est requis pour renvoyer le lien",

        reset_title: 'Réinitialiser le mot de passe',
        reset_subtitle: 'Entrez un nouveau mot de passe pour votre compte.',
        reset_cta: 'Réinitialiser le mot de passe',
        reset_success: 'Mot de passe réinitialisé',
        reset_success_desc:
          'Votre mot de passe a été mis à jour. Veuillez vous connecter avec votre nouveau mot de passe.',
        reset_error: 'Échec de la réinitialisation du mot de passe',

        reset_token: 'Jeton de réinitialisation',
        reset_token_placeholder:
          'Collez le jeton ici si vous n’utilisez pas directement le lien',
        hide_token: 'Masquer',
        enter_token: 'Saisir le jeton',
        using_link_token:
          'Utilisation du jeton du lien — vous pouvez en saisir un autre manuellement ci-dessous.',
        reset_token_expired_desc:
          'Le jeton peut être invalide ou expiré. Vous pouvez demander un nouveau lien ci-dessous.',

        password_confirm: 'Confirmer le mot de passe',
        password_min: 'Le mot de passe doit contenir au moins 8 caractères',
        password_mismatch: 'Les mots de passe ne correspondent pas',
        no_token: 'Jeton de réinitialisation manquant',
      },
      tooltip: {
        lightMode: 'Passer en mode clair',
        darkMode: 'Passer en mode sombre',
        logout: 'Se déconnecter',
      },
      aria: {
        toggleTheme: 'Changer de thème',
        logout: 'Se déconnecter',
      }
    }
  },

  ar: {
    translation: {
      ai: {
        coach: {
          title: "قابل مدرّب التداول ",
          subtitle: "دروس متكيّفة، ملاحظات فورية، ومحاكاة إستراتيجية مصممة خصيصًا لك — متوفرة 24/7 بالعربية والفرنسية والإنجليزية.",
          card1: "منهج متكيّف",
          card1_desc: "يتعلّم أسلوبك ونقاط قوتك وضعفك. يسرّع المواضيع الصعبة ويتجاوز ما أتقنته.",
          card2: "محاكاة وتقييم التداول",
          card2_desc: "أعد تشغيل نقاط الدخول والخروج والإدارة في السياق. احصل على تحليل منطقي وليس مجرد درجات.",
          card3: "متوافق مع الشريعة",
          card3_desc: "تسوية فورية، بدون ربا، وتقليل الغرر. إرشاد واضح على الأساليب المباحة.",
          cta: {
            primary: "جرّب المدرّب الذكي",
            secondary: "شاهد كيف يعمل"
          }
        },
        how: {
          title: "كيف يعمل",
          step1: "الملف والأهداف",
          step1_desc: "أخبرنا بوقتك ومستوى المخاطرة وأهدافك.",
          step2: "دروس متكيّفة",
          step2_desc: "دروس قصيرة تناسب سرعتك بالعربية أو الفرنسية أو الإنجليزية.",
          step3: "المحاكاة والممارسة",
          step3_desc: "شغّل محاكاة إستراتيجية مع ملاحظات موجهة.",
          step4: "ابدأ بالتداول (اختياري)",
          step4_desc: "انتقل إلى وسطاء متوافقين مع الشريعة واستمر بالتعلّم مع الذكاء الاصطناعي."
        }
      },
      powered: {
        badge: "مدعوم ",
        learning: "تعلّم مخصص وتدريب ذكي",
        reasoning: "تحليل وتدوين إشارات التداول",
        languages: "FR • AR • EN"
      },
       token: {
        loadingPortfolio: "جارٍ تحميل المحفظة…",

        hero: {
          title: "رمز مكتب المتداولين",
          sub: "مصمم لدعم تجربة غرفة التداول: مزايا، مكافآت، ووصول للمجتمع — بإطلاق يراعي الامتثال أولاً."
        },

        landing: {
          plannedBadge: "{{symbol}} (مخطط)",
          enterTradingFloor: "الدخول إلى غرفة التداول",
          explore: "استكشاف",
          buyTokens: "شراء الرموز",
          totalSupply: "إجمالي المعروض: {{total}}",
          complianceNote:
            "هذه الصفحة معلومات منتج/خارطة طريق فقط. ليست نصيحة مالية ولا عرض بيع، وقد تتغير الشروط وفق المراجعة القانونية والامتثال."
        },

        chart: {
          title: "مخطط السوق",
          loading: "جارٍ تحميل المخطط…",
          noData: "لا توجد بيانات بعد.",
          tf1m: "1د",
          tf5m: "5د",
          tf15m: "15د",
          tf1h: "1س"
        },

        metrics: {
          title: "ملخص الرمز",
          sub: "معايير أولية بسيطة وشفافة للإطلاق المخطط.",
          initialPrice: "السعر المبدئي",
          onlyPair: "زوج التداول",
          lock: "قفل التخزين",
          lockValue: "{{months}} شهر"
        },

        utilities: {
          title: "الاستخدامات (مخطط)",
          sub: "مصممة لتحسين التعلم والمسؤولية داخل المجتمع.",
          items: {
            "Trading Floor Access": {
              title: "الوصول إلى غرفة التداول",
              body: "فتح غرف ديسكورد، مراجعات مباشرة، وقنوات حسب الدور."
            },
            "Community Rewards": {
              title: "مكافآت المجتمع",
              body: "نظام مكافآت مخطط للنشاط وسلاسل التعلم ومراجعات الأداء (وفق السياسة)."
            },
            "Staking (Locked)": {
              title: "تخزين (مقفول)",
              body: "قفل مخطط لمدة 12 شهرًا من تاريخ التخزين. قد تتغير الشروط حسب الامتثال."
            },
            "Guides + Communities Boost": {
              title: "تعزيز الأدلة والمجتمعات",
              body: "خصومات ووصول مبكر وامتيازات عبر الأدلة والمجتمعات (مخطط)."
            }
          }
        },

        dist: {
          title: "التوزيع (مسودة)",
          sub: "نموذج تخصيص شفاف (مسودة). قد يتغير التوزيع النهائي حسب الامتثال.",
          items: {
            "Community Rewards": {
              label: "مكافآت المجتمع",
              note: "حوافز وتفاعل مخطط"
            },
            "Liquidity & Market Making": {
              label: "السيولة وصناعة السوق",
              note: "زوج واحد مبدئي (مخطط)"
            },
            "Treasury / Ecosystem": {
              label: "الخزانة / النظام البيئي",
              note: "نمو، شراكات، تشغيل"
            },
            "Team (Vested)": {
              label: "الفريق (مستحق تدريجيًا)",
              note: "مواءمة طويلة المدى (استحقاق مخطط)"
            },
            "Advisors / Partners": {
              label: "مستشارون / شركاء",
              note: "توسع استراتيجي"
            }
          },
          footnote: "* التوزيع المعروض مسودة لأغراض واجهة المستخدم/خارطة الطريق فقط."
        },

        cta: {
          title: "ابدأ الآن",
          sub: "اشترِ الرموز لفتح المزايا والمشاركة في حوض مشاركة الأرباح.",
          buyTokens: "شراء الرموز",
          enterDiscord: "الدخول إلى ديسكورد"
        },

        holdings: {
          title: "ممتلكات {{symbol}}",
          poolShare: "حصة الحوض:",
          tokensOwned: "الرموز المملوكة",
          positionValue: "قيمة المركز",
          unlockDate: "تاريخ الفتح",
          lockedNote: "مقفول حتى تاريخ الفتح",
          lockedUntil: "مقفول حتى {{date}}",
          earnedEstimate: "المكتسب (تقريبي)",
          earnedFormula: "تقدير باستخدام {{pct}}% مشاركة أرباح",
          purchasesTitle: "المشتريات",
          purchaseLine: "{{tokens}} رمز • مستحق USDT: {{usdt}}",
          marketBuy: "شراء سوق",
          marketSell: "بيع سوق",
          enterTradingFloor: "الدخول إلى غرفة التداول"
        },

        order: {
          usdt: "USDT",
          price: "السعر",
          tokens: "الرموز",
          buy: "شراء",
          sell: "بيع",
          buyLower: "شراء",
          sellLower: "بيع",
          buyTitle: "شراء {{symbol}}",
          sellTitle: "بيع {{symbol}}",
          buySubmitted: "تم إرسال أمر الشراء",
          sellSubmitted: "تم إرسال أمر البيع",
          orderFailed: "فشل الأمر",
          marketNote: "أوامر السوق تُنفَّذ بأفضل سعر متاح.",
          inputTokens: "الرموز",
          inputUsdt: "USDT",
          tokensPlaceholder: "أدخل كمية الرموز",
          usdtPlaceholder: "أدخل قيمة USDT",
          estimatedTokens: "الرموز المتوقعة",
          estimatedValue: "القيمة المتوقعة",
          maxSellable: "الحد الأقصى للبيع: {{amount}} {{symbol}}",
          sellTooMuch: "لا تملك رصيدًا كافيًا لبيع هذه الكمية.",
          confirmTitle: "تأكيد {{side}}",
          confirmDesc: "يرجى تأكيد أنك تريد {{side}} بسعر السوق.",
          usdtEst: "USDT المتوقعة",
          confirmBtn: "تأكيد {{side}}"
        },

        unstake: {
          title: "إلغاء التخزين",
          openBtn: "إلغاء التخزين",
          available: "المتاح",
          lockedHoldings: "أرصدة مقفولة",
          unlockDate: "تاريخ الفتح:",
          earlyWarningShort: "الفتح المبكر يخصم رسومًا.",
          modeNormal: "عادي",
          modeEarly: "مبكر",
          placeholder: "الكمية لإلغاء التخزين",
          fee: "الرسوم",
          receive: "ستستلم",
          earlyForfeit: "تُطبق رسوم إلغاء التخزين المبكر.",
          confirm: "تأكيد",
          success: "تم إرسال طلب إلغاء التخزين",
          failTitle: "فشل إلغاء التخزين"
        },

        wallet: {
          title: "ربط محفظة USDT",
          trc20: "TRC20",
          erc20: "ERC20",
          placeholderTrc: "أدخل عنوان TRC20",
          placeholderErc: "أدخل عنوان ERC20",
          note: "تأكد أن العنوان يطابق الشبكة المحددة.",
          success: "تم ربط المحفظة",
          failTitle: "فشل الربط"
        },

        walletCard: {
          title: "نظرة عامة على المحفظة",
          connectedWallet: "المحفظة المتصلة",
          copied: "تم نسخ العنوان",
          loading: "جارٍ تحميل الأرصدة والأسعار…",
          noteMultiChain: "أرصدة SOL/BTC تقديرية ما لم يتم حفظ عناوين كل شبكة للمستخدم."
        }
      },
      brand: 'promrkts',
      Forex_Gold_Indices: "الفوركس / الذهب / المؤشرات",
      Crypto: "العملات الرقمية",
      All_Forex_Headlines: "جميع أخبار الفوركس",
      Forex_Timeline: "آخر أخبار الفوركس",
      Gold_XAUUSD_Headlines: "أخبار الذهب (XAUUSD)",
      Gold_Timeline: "آخر أخبار الذهب",
      Indices_Headlines: "أخبار المؤشرات",
      Indices_Timeline: "آخر أخبار المؤشرات",
      All_Crypto_Headlines: "جميع أخبار العملات الرقمية",
      Crypto_Timeline: "آخر أخبار العملات الرقمية",
      subscriptions: {
        tab: "الاشتراكات",
        vip: "VIP",
      },
      celebration: {
        title: "تم تأكيد الانضمام!",
        body: "تهانينا، تم تسجيلك بنجاح في {{course_name}}.",
        course_fallback: "الدورة",
        cta_hint: "اضغط بالأسفل للبدء في طريقك نحو إتقان التداول.",
        shortcut: "اذهب إلى الدورات",
        vip_ready: "تم تفعيل VIP",
        vip_ready_desc: "انضم إلى مجموعة VIP على تيليجرام للوصول إلى الإشارات والجلسات المباشرة والدردشة المميزة.",
        vip_join: "فتح VIP على تيليجرام",
        vip_offer: "أضف اشتراك VIP الشهري الآن:",
        vip_subscribe: "اشترك في VIP",
        help: "هل تحتاج مساعدة؟ تواصل معنا في مجتمعنا في أي وقت.",
        cta: "اذهب إلى دوراتي",
      },        
      nav: {
        search: 'بحث',
        enrolled: 'كورساتي',
        signIn: 'تسجيل الدخول',
        signOut: 'تسجيل الخروج',
        contact: 'اتصل بنا',
      },
      crypto: {
        title: "دليل USDT",
        subtitle: "دليل موجز وموثوق لشراء وإرسال والتحقق من USDT بأمان.",
        what_is_usdt: {
          title: "ما هو USDT؟",
          desc: "USDT (تيثر) عملة مستقرة صمّمت لتعكس قيمة الدولار الأمريكي عبر عدة سلاسل بلوكشين."
        },
        note_stablecoin: "USDT عملة مستقرة تتبع قيمة الدولار الأمريكي (1 USDT ≈ 1$).",
        chains: {
          title: "الشبكات التي تدعم USDT",
          desc: "يتوفر USDT على عدة شبكات بلوكشين، وتختلف الرسوم والسرعات حسب الشبكة.",
          erc20: "مدعوم على نطاق واسع، لكن الرسوم قد ترتفع عند الازدحام.",
          bep20: "رسوم أقل من ERC20؛ متوافق مع محافظ شبكة BNB.",
          trc20: "عادةً الأرخص والأسرع لعمليات تحويل USDT."
        },
        fees_tip: "نصيحة: TRC20 غالبًا الأرخص والأسرع لتحويلات USDT.",
        buy: {
          title: "كيفية شراء USDT",
          desc: "اختر منصة موثوقة أو بائعًا محليًا مُوثقًا.",
          global_title: "منصات عالمية",
          libya_title: "الشراء داخل ليبيا",
          libya_desc: "استخدم منصات موثوقة أو مكاتب صرافة ذات تقييمات جيدة."
        },
        kyc_warning: "استخدم بائعين موثّقين وأكمل التحقق من الهوية (KYC) عند الحاجة. تجنّب التداولات المباشرة بدون وساطة موثوقة.",
        send: {
          title: "كيفية إرسال USDT",
          desc: "تحقق دائمًا من عنوان المحفظة والشبكة قبل الإرسال.",
          steps: {
            1: "انسخ عنوان المستلم بدقة.",
            2: "اختر الشبكة الصحيحة (مثل TRC20).",
            3: "أرسل تجربة صغيرة أولًا للتأكد.",
            4: "أرسل المبلغ الكامل بعد التأكيد."
          }
        },
        txn: {
          title: "مثال على معرّف المعاملة",
          desc: "هكذا قد يبدو مُعرّف (هاش) معاملة على البلوكشين.",
          note: "يمكنك تتبّع هذا الهاش على أي مستكشف بلوكشين عام."
        },
        network_match_tip: "طابق الشبكة دائمًا بين المرسل والمستلم (مثل TRC20 ↔ TRC20).",
        guide: {
          quick: {
            title: "دليل سريع: اشترِ → حدّد الشبكة → أرسل → أكّد",
            buy: "اشترِ USDT من منصة أو بائع موثّق.",
            network: "اختر TRC20 ما لم يُنصَح بغير ذلك لتقليل الرسوم/زيادة السرعة.",
            verify: "ألصق العنوان، وتحقق من أول/آخر 4 أحرف، وأرسل تجربة 1$، ثم المبلغ الكامل."
          }
        },
        faq: {
          title: "الأسئلة الشائعة",
          network_wrong: {
            q: "ماذا لو اخترت الشبكة الخاطئة؟",
            a: "قد تُفقَد الأموال. تأكد دائمًا من الشبكة مع المستلم قبل الإرسال."
          },
          fees: {
            q: "لماذا وصلني مبلغ أقل؟",
            a: "تفرض المنصات والشبكات رسومًا. أرسل مبلغًا أكبر قليلًا أو احسب الرسوم مسبقًا."
          }
        },
        video: {
          title: "دليل بالفيديو: شراء وإرسال USDT (TRC20)",
          desc: "شاهد شرحًا خطوة بخطوة لكيفية شراء USDT (TRC20) وإرساله بأمان.",
          url: ""
        },
        cta_enroll: "سجّل الآن",
        cta_disclaimer: "محتوى تعليمي فقط. هذا ليس نصيحة مالية."
      },
      actions: {
        refresh: "تحديث",
        confirm: "تأكيد",
        view_details: "عرض التفاصيل",
        enroll: "اشترك",
        fail: "فشل",
        verify: "تحقق",
        crypto_guide: "دليل العملات الرقمية",
      },
      notes: {
        usdt_trc20: "يجب إرسال جميع إيداعات USDT عبر شبكة TRC20 (ترون).",
        network_reminder: "استخدم شبكة TRC20 لمدفوعات USDT."
      },
      sections: {
        pending_payments: "المدفوعات المعلّقة",
        pending_users: "المستخدمون المعلّقون",
        pending_businesses: "الأنشطة التجارية المعلّقة"
      },
      statuses: {
        pending: "معلّق",
        confirmed: "مؤكّد",
        failed: "فاشل"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "المستخدم: {{name}} ({{email}})",
        course_line: "الكورس: {{course}}",
        proof_line: "الإثبات: {{hash}}",
        created_at: "تم الإنشاء: {{date}}",
        owner_line: "المالك: {{owner}}",
        yes: "نعم",
        no: "لا",
        na: "غير متاح"
      },
      empty_states: {
        no_pending_payments: "لا توجد مدفوعات معلّقة.",
        no_pending_users: "لا يوجد مستخدمون معلّقون.",
        no_pending_businesses: "لا توجد أنشطة تجارية معلّقة."
      },
      forbidden: {
        title: "ممنوع",
        message: "يجب أن تكون مديرًا للوصول إلى هذه الصفحة."
      },
      common: {
        select: 'اختر',
        save: 'حفظ',
        upload: 'رفع',
        anonymous: 'طالب',
        loading: 'جارٍ التحميل...',
        confirm: 'تأكيد',
        reviews: 'المراجعات',
        products: 'المنتجات',
        no_messages: 'لا توجد رسائل',
        copy: 'نسخ',
        hide: 'إخفاء',
        download_qr: 'تحميل QR',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        refresh: 'تحديث',
        only_unread: 'فقط الرسائل غير المفروضة',
        show_all: 'عرض الكل',
        export_csv: 'تصدير إلى ملف CSV',
        course: 'كورس',
        message: 'رسالة',
        meta: 'البيانات',
        page: 'الصفحة',
        reply: 'رد',
        whatsapp: 'WhatsApp',
        show: 'عرض',
        reject: 'رفض',
        price: 'السعر',
        price_usdt: 'السعر (USDT)',
        price_stripe: 'السعر (Stripe بالسنت)',
        create: 'إنشاء',
        delete: 'حذف',
        prev: 'السابق',
        next: 'التالي',
        click_to_load: 'انقر للتحميل',
        video: 'فيديو',
        title: 'العنوان',
        expires_in: 'تاريخ انتهاء صلاحية السعر',
        expires_at: 'ينتهي في',
        close: 'إغلاق',
        subtitle: 'العنوان الفرعي',
        note: 'ملاحظة',
        name: 'الاسم',
        origin: 'الانطلاق',
        destination: 'الوجهة',
        airline: 'الشركة',
        image_url: 'رابط الصورة',
        select_image: 'اختر صورة…',
        preview: 'معاينة',
        forbidden: 'ممنوع',
        copied: 'تم النسخ',
        got_it: 'فهمت، شكراً!',
      },
      instructor: {
        name: 'اسم المدرّس',
        avatar_url: 'رابط الصورة الشخصية',
        bio: 'نبذة عن المدرّس',
        upload_photo: 'رفع صورة المدرّس',
      },
      course: {
        level: {
          beginner: 'مبتدئ',
          intermediate: 'متوسط',
          advanced: 'متقدم'
        }
      },
      social: {
        telegram_embed: 'رابط تضمين تيليغرام',
        telegram_join: 'رابط الانضمام لتيليغرام',
        discord_widget: 'معرّف ويدجت ديسكورد',
        discord_invite: 'رابط دعوة ديسكورد',
        twitter_timeline: 'رابط مخطط X/تويتر'
      },
      materials: {
        title: 'المواد',
        load: 'تحميل المواد',
        upload_pdf: 'رفع PDF',
        upload_video: 'رفع فيديو',
        none: 'لا توجد مواد محمّلة. اضغط "تحميل المواد".',
        staged_title: 'مواد (قيد الانتظار)',
        add_pdfs: 'إضافة ملفات PDF',
        add_videos: 'إضافة فيديوهات',
        files_selected: '{{count}} ملف/ملفات محددة',
        staged_note: 'سيتم رفع هذه الملفات وإرفاقها بعد الضغط على إنشاء.'
      },
      admin: {
        title: 'لوحة التحكم',
        subtitle: 'ادارة الموقع والخدمات',
        promos: 'العروض',
        jobs: 'الوظائف',
        applications: 'الطلبات',
        progress: 'التقدم',
        prizes: 'الجوائز',
        communications: 'التواصلات',
        badge_stats: {
          title: 'إحصائيات الشارات',
          total_badges: 'إجمالي الشارات',
          most_popular: 'الأكثر شعبية',
          rarest: 'الأندر',
          students: 'طلاب',
          available: 'متاح للفتح',
          unlock_stats: 'إحصائيات الفتح',
        },
        comm: {
          search_ph: 'ابحث بالاسم أو البريد أو الرسالة…',
          status_read: 'مقروء',
          status_open: 'مفتوح',
          mark_unread: 'تعيين كغير مقروء',
          mark_read: 'تعيين كمقروء',
          ticket_id: 'التذكرة',
        },
        content: 'المحتوى',
        admin_overview: 'نظرة عامة',
        pending_transactions: 'العمليات المعلقة',
        banners: 'لافتات',
        quick_actions: 'إجراءات سريعة',
        revenue_over_time: 'الإيرادات عبر الزمن',
        traffic_conversions: 'الزيارات والتحويلات',
        purchase_status_breakdown: 'تفصيل حالات الشراء',
        revenue_split: 'تقسيم الإيرادات',
        top_courses_revenue: 'أعلى الكورسات إيراداً',
        course_views_sales: 'مشاهدات الكورس مقابل المبيعات',
        verifications: 'التحقق',
        analytics: 'تحليلات',
        create_content: 'إنشاء محتوى',
        create_banner: 'إنشاء لافتة',
        trailer_url: 'رابط المقدّمة',
        preview_url: 'رابط المعاينة',
        upload_trailer: 'رفع المقدّمة (فيديو)',
        upload_preview: 'رفع المعاينة (فيديو)',
        course_tiers: 'مستويات الكورس',
        pending_users: 'المستخدمين المعلقين',
        pending_businesses: 'المؤسسات المعلقة',
        pending_payments: 'المدفوعات المعلقة',
        pending_usdt: 'USDT المعلّق',
        pending_balance: 'الرصيد المعلّق',
        overview: 'نظرة عامة',
        view: 'عرض',
        must_be_admin: 'يجب أن تكون مديرًا لعرض هذه الصفحة.',
      },
      header: {
        hi: 'مرحباً، {{name}}',
        dashboard: 'لوحة التحكم',
        account: 'حسابي',
        cart: 'السلة',
        emptyCart: 'السلة فارغة',
        clearCart: 'مسح السلة',
        close: 'إغلاق',
      },
      contact: {
        title: "اتصل بنا",
        subtitle: "أرسل لنا رسالة وسنعاود التواصل معك قريبًا.",
        name: "الاسم",
        name_ph: "الاسم الكامل",
        basic_info: "معلومات أساسية",
        phone_info: "رقم الهاتف (اختياري)",
        details: "تفاصيل",
        email: "البريد الإلكتروني",
        email_ph: "you@example.com",
        course: "الكورس (اختياري)",
        course_ph: "اختر كورس",
        course_fallback: "كورس",
        message: "الرسالة",
        message_ph: "اخبرنا بما تحتاجه بالتفصيل...",
        send: "إرسال الرسالة",
        sent: "تم إرسال رسالتك. سنعاود التواصل معك قريبًا.",
        error_send: "تعذر إرسال الرسالة",
        validation_required: "يرجى تعبئة جميع الحقول المطلوبة.",
        alt: "تفضّل واتساب أو تيليجرام؟",
        whatsapp: "واتساب",
        telegram: "تيليجرام",
        default_text: "مرحبًا، أود معرفة المزيد عن كورساتكم.",
        course_id: "معرّف الكورس",
        toast_sent_title: "تم إرسال الرسالة",
        toast_sent_desc: "سنتواصل معك قريبًا."
      },
      checkout: {
        title: "الدفع",
        subtitle: "أكمِل تسجيلك بطرق دفع سريعة ومرنة.",
        free: "مجاني",
        no_tier: "لم يتم اختيار باقة الكورس. عُد واختر كورس.",
        customer: {
          details: "بيانات العميل",
          full_name: "الاسم الكامل",
          email: "البريد الإلكتروني",
          country: "الدولة/المنطقة",
          pref_lang: "لغة الكورس المفضلة"
        },
        lang: { en: "الإنجليزية", ar: "العربية", fr: "الفرنسية" },
        placeholders: {
          name: "اسمك",
          country: "اختر الدولة"
        },
        payment: {
          title: "طريقة الدفع",
          usdt: "USDT (TRC20)",
          libyana: "رصيد ليبيانا",
          madar: "رصيد المدار"
        },
        addons: {
          vip: {
            title: "تيليجرام VIP (شهري)",
            subtitle: "اشتراك شهري. إلغاء في أي وقت.",
            choose: "إضافة (شهرياً)"
          }
        },
        libyana: {
          title: "الدفع عبر رصيد ليبيانا",
          instructions: "أرسل المبلغ إلى الرقم التالي:",
          note: "بعد الدفع سيتم تأكيد اشتراكك من فريقنا."
        },
        madar: {
          title: "الدفع عبر رصيد المدار",
          instructions: "أرسل المبلغ إلى الرقم التالي:",
          note: "بعد الدفع سيتم تأكيد اشتراكك من فريقنا."
        },
        actions: {
          complete: "إتمام الشراء",
          back: "رجوع"
        },
        summary: {
          title: "ملخص الطلب",
          course: "الكورس",
          subtotal: "الإجمالي قبل الضريبة",
          taxes: "الضرائب",
          total: "الإجمالي"
        },
        benefits: {
          certificate: "ستحصل على شهادة إنجاز",
          lifetime: "وصول مدى الحياة إلى جميع الباقات",
          vipSignals: "+ الانضمام إلى مجموعة إشارات تيليجرام VIP",
          brokerBonus: "انضم إلى وسيطنا المعتمد واستمتع ببونص مجاني 50–100% على إيداعاتك"
        },
        modal: {
          title: "تفاصيل الدفع",
          remaining: "الوقت المتبقي:",
          send_to: "أرسل USDT (TRC20) إلى:",
          amount: "القيمة (تقريباً):",
          txid_prompt: "أدخل معرّف العملية (TXID) بعد إرسال USDT.",
          txid_ph: "معرّف العملية",
          phone_prompt: "أدخل رقم الهاتف الذي أرسلت منه الرصيد.",
          status: "الحالة الحالية:",
          verifying: "نقوم بالتحقق من معاملتك. قد يستغرق ذلك بضع دقائق.",
          awaiting: "بانتظار تأكيد يدوي من المشرف. ستصلك الصلاحية بعد التحقق.",
          close: "إغلاق",
          paid: "تم الدفع"
        },
        errors: {
          txid_required: "يرجى إدخال معرّف العملية",
          phone_required: "يرجى إدخال رقم هاتف المُرسل",
          proof_failed: "تعذّر إرسال الإثبات"
        }
      },
      progress: {
        title: 'تقدمي',
        overview: 'نظرة عامة',
        badges: 'الشارات',
        leaderboard: 'لوحة المتصدرين',
        level: 'المستوى',
        xp: 'نقاط الخبرة',
        streak: 'السلسلة',
        days: 'أيام',
        courses_completed: 'الكورسات المكتملة',
        total_xp: 'إجمالي نقاط الخبرة',
        xp_to_next_level: 'نقاط للمستوى التالي',
        days_in_a_row: 'أيام متتالية',
        out_of: 'من',
        course_progress: 'تقدم الكورس',
        complete: 'مكتمل',
        lessons: 'دروس',
        videos: 'فيديوهات',
        pdfs: 'ملفات PDF',
        completed: 'مكتمل',
        in_progress: 'قيد التقدم',
        not_started: 'لم يبدأ',
        keep_learning: 'استمر في التعلم!',
        great_progress: 'تقدم رائع! استمر!',
        xp_earned: 'نقاط خبرة مكتسبة',
        progress_saved: 'تم حفظ التقدم!',
        badge_unlocked: 'تم فتح شارة!',
        new_level: 'مستوى جديد!',
        reached_level: 'وصلت إلى المستوى {{level}}!',
      },
      badges: {
        title: 'الشارات',
        my_badges: 'شاراتي',
        all_badges: 'جميع الشارات',
        unlocked: 'مفتوحة',
        locked: 'مقفلة',
        no_badges_yet: 'لا توجد شارات مفتوحة بعد',
        complete_lessons: 'أكمل الدروس والكورسات لكسب الشارات!',
        rarity: {
          common: 'عادية',
          rare: 'نادرة',
          epic: 'ملحمية',
          legendary: 'أسطورية',
        },
        category: {
          milestone: 'إنجاز',
          achievement: 'تحصيل',
          streak: 'سلسلة',
          special: 'خاصة',
        },
        unlock_progress: 'تقدم الفتح',
        unlocked_at: 'فتحت في',
      },
      leaderboard: {
        title: 'لوحة المتصدرين',
        subtitle: 'اكتشف من يقود الطريق نحو إتقان التداول',
        top_students: 'أفضل الطلاب',
        rank: 'الترتيب',
        student: 'الطالب',
        level: 'المستوى',
        xp: 'نقاط الخبرة',
        you: 'أنت',
        top_3: 'أفضل 3',
        how_to_compete: 'كيف تتنافس',
        loading: 'جار التحميل...',
        no_data: 'لا توجد بيانات متاحة',
        onboarding: {
          title: 'تسلق لوحة المتصدرين!',
          description: 'تنافس مع الطلاب الآخرين واكسب مكانك في القمة! إليك كيفية كسب نقاط الخبرة والتقدم في الترتيب:',
          watch_videos: 'شاهد الفيديوهات',
          watch_videos_desc: 'أكمل دروس الفيديو لكسب الخبرة',
          read_pdfs: 'اقرأ ملفات PDF',
          read_pdfs_desc: 'ادرس مواد الكورس والموارد',
          complete_lessons: 'أكمل الدروس',
          complete_lessons_desc: 'أنهِ الدروس الكاملة لترتقي بمستواك بشكل أسرع',
          complete_courses: 'أكمل الكورسات',
          complete_courses_desc: 'أنهِ الكورسات الكاملة للحصول على دفعات ضخمة من نقاط الخبرة',
          maintain_streak: 'حافظ على سلسلتك',
          maintain_streak_desc: 'تعلم كل يوم لكسب مكافآت السلسلة',
          pro_tip: 'نصيحة احترافية:',
          pro_tip_desc: 'افتح الشارات بالوصول إلى المعالم! الشارات تعرض إنجازاتك وتفانيك. تحقق من صفحة التقدم الخاصة بك لمعرفة الشارات التي يمكنك فتحها بعد ذلك.',
          view_progress: 'عرض تقدمي',
          get_started: 'ابدأ',
        },
      },
      dashboard: {
        title: 'لوحة التحكم',
        subtitle: 'إدارة الكورسات والحساب',
        available: 'متاح',
        communications: "الرسائل",
        pending_transactions: 'العمليات المعلقة',
        active_learning: 'تعلم نشط',
        all_time: 'إجمالي',
        overview: 'نظرة عامة',
        total_revenue: 'إجمالي الإيرادات',
        users: 'المستخدمون',
        site_views: 'مشاهدات الموقع',
        sessions_purchase: 'الجلسات → شراء',
        session_conversion: 'تحويل الجلسات',
        signup_buyer: 'تسجيل → مشتري',
        lead_conversion: 'تحويل العملاء المحتملين',
        arpu_aov: 'متوسط العائد/المستخدم • متوسط قيمة الطلب',
        avg_rev_user_aov: 'متوسط العائد/المستخدم • AOV',
        usdt_stripe: 'USDT + سترايب',
        pending_over_time: 'العمليات المعلّقة عبر الزمن',
        purchase_id: 'المعرّف',
        user: 'المستخدم',
        tier: 'المستوى',
        pending: 'معلّق',
        proof: 'الإثبات',
        id: 'المعرّف',
        email: 'البريد الإلكتروني',
        name: 'الاسم',
        courses: 'كورساتي',
        account: 'الحساب',
        admin: 'إدارة',
        purchases: 'المشتريات',
        settings: 'الإعدادات',
        language: 'اللغة',
        total_courses: 'إجمالي الكورسات',
        enrolled: 'الملتحق بها',
        no_courses: 'لست ملتحقاً بأي كورس بعد.',
        continue: 'متابعة',
        no_purchases: 'لا توجد مشتريات بعد.',
        open: 'فتح',
        settings_hint: 'Use the header controls to switch language. More settings coming soon.',
        vip_title: 'VIP Telegram',
        vip_status_active: 'مفعل',
        vip_status_inactive: 'غير مفعل.',
        vip_join: 'فتح Telegram VIP',
        vip_started: 'اشتركت في',
        vip_renews: 'تجدد في',
        vip_subscribe: 'اشترك',
        vip_renew: 'تجديد الاشتراك',
        vip_days_left: 'الايام المتبقية',
      },
      account: {
        title: 'حسابي',
        subtitle: 'تفاصيل الملف الشخصي وإعدادات الحساب',
      },
      learn: {
        loading: "جارٍ تحميل الكورس...",
        course_fallback: "الكورس",
        actions: {
          mark_completed: "اتممت الكورس",
          my_courses: "كورساتي"
        },
        forex: {
          title: "ما هو الفوركس؟",
          subtitle: "تتداول العملات أزواجًا. تشتري عملة وتبيع الأخرى — بتنفيذ فوري.",
          points: {
            spot: "تنفيذ فوري فقط (بدون تأجيل).",
            no_riba: "بدون فائدة/swap (لا ربا).",
            ecn: "استخدم وسيط ECN — تمتلك الأصول رقميًا.",
            gharar: "قلّل الغرر: تعلّم الأساسيات واتخذ قرارًا واضحًا."
          }
        },
        crypto: {
          title: "ما هي العملات الرقمية؟",
          subtitle: "أصول رقمية على البلوكتشين. تداول وتحويل بين الأفراد.",
          points: {
            ownership: "اشترِ الأصل مباشرة وتجنّب المنتجات ذات الفائدة.",
            no_interest: "بدون فائدة (لا ربا).",
            education: "خفّف الغرر: افهم المخاطر وتداول بتروٍ."
          }
        },
        disclaimer: "حلال مع التنفيذ الفوري، دون ربا، وتقليل المضاربة.",
        disclaimer_short: "مباح مع تجنّب الربا/الميسر وتقليل الغرر.",
        completion: {
          marked: "تم الإنتهاء"
        },
        reviews: {
          title: "المراجعات",
          loading: "جارٍ تحميل المراجعات…",
          leave: "ترك مراجعة",
          submit: "إرسال المراجعة",
          rating_required: "التقييم مطلوب",
          thanks: "شكراً على مراجعتك!",
          submit_failed: "فشل في إرسال المراجعة",
          comment_placeholder: "اكتب مراجعتك هنا...",
          verified: "مُوثوق",
          empty: "لا توجد مراجعات بعد."
        },
        certificate: {
          get: "الحصول على الشهادة",
          share: "مشاركة الشهادة",
          download: "تحميل الشهادة",
          preview: "عرض الشهادة",
          copy: "نسخ الرابط",
          copied: "تم نسخ الرابط"
        },
        instructor: {
          title: "المدرّس"
        },
        materials: {
          title: "مواد الكورس",
          preview: "فيديو تمهيدي",
          trailer: "المقدمة",
          telegram: "مجموعة تيليغرام",
          discord: "ديسكورد",
          twitter: "تويتر",
          empty: "لا توجد مواد منشورة بعد."
        },
        documents: {
          title: "المستندات",
          loading: "جارٍ تحميل المستند…"
        },
        videos: {
          title: "الفيديوهات"
        },
        chart: {
          title: "ممارسة الرسوم البيانية المباشرة",
          description: "تدرب على قراءة الرسوم البيانية في الوقت الفعلي. استخدم الأدوات أدناه لتحليل حركة السعر وتحديد الأنماط وتطبيق ما تعلمته.",
          tip: "💡 نصيحة: جرب أطر زمنية ورموز مختلفة لممارسة مهارات التحليل الخاصة بك"
        },
        guard: {
          note: "تم تعطيل التنزيل. لا ننصح بالتقاط لقطات الشاشة."
        },
        support: {
          title: "تحتاج مساعدة؟",
          body: "إذا كنت تعتقد أن هذا الوصول عن طريق الخطأ، تواصل مع الدعم واذكر رقم عملية الشراء."
        },
        access: {
          title: "الوصول إلى الكورس",
          denied_fallback: "ليس لديك صلاحية للوصول إلى هذه الكورس.",
          back_to_my_courses: "العودة إلى كورساتي"
        },
        errors: {
          access_denied: "تم رفض الوصول. يجب أن تكون مسجلاً في الكورس.",
          load_failed: "فشل تحميل الكورس",
          complete_failed: "فشل تكتمل الكورس"
        },
        watermark: {
          user: "المستخدم: {{user}}"
        },
        capture: {
          title: "تم حظر لقطة الشاشة",
          body: "لحمايتك ولحماية هذه الكورس، يتم تقييد لقطات الشاشة والتسجيل.",
          pfp_blocked: "تم حظر اللقطة"
        }
      },
      lead: {
       title: "دليل التداول الحلال في 3 خطوات",
        subtitle: "بالإضافة إلى درس مجاني فوري وتوصيات أسبوعية.",
        cta: "انضم",
        placeholder: "أدخل بريدك الإلكتروني",
        name: "اسمك",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        name_required: 'يرجى إدخال اسمك.',
        email_invalid: 'يرجى إدخال بريد إلكتروني صحيح.',
        phone_invalid: 'يرجى إدخال رقم هاتف صحيح.',
        success: "شكرًا لاهتمامك!",
        error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      },
      home: {
        offers: 'عروض لوقت محدود',
        spin_and_win: 'ادخل السحب',
        searching: 'جارٍ البحث...',
        form_note: 'إلغاء مجاني على بعض الأسعار المختارة',
        search: 'بحث',
        powered: {
          badge: "مدعوم بواسطة الذكاء الاصطناعي",
          learning: "تعلم شخصي و مساعدة",
          reasoning: "اصدار اشارات تداول لغرض التعليم",
          languages: "يدعم اللغة الفرنسية • العربية • الإنجليزية",
        },
        metrics: {
          active_programs_label: "البرامج النشطة",
          active_programs_helper: "جارٍ العمل عليها حاليًا",
          streak_label: "سلسلة التعلّم",
          days: "أيام",
          streak_helper: "حافظ على السلسلة لتحصل على الشارات",
          hours_label: "ساعات التعلّم",
          hrs: "س",
          hours_helper: "آخر 30 يومًا (تقريبًا)",
          completion_label: "نسبة إكمال المسار",
          completion_helper: "على مستوى جميع برامجك النشطة",
        },
        hero: {
          title: 'أتقن التداول مع الخبراء.',
          subtitle: 'انضم إلى +4,200 طالب يحققون أرباحًا حقيقية خلال حوالي 4 أسابيع فقط.',
          cta_primary: 'ابدأ التعلم الآن',
          welcome: 'أهلاً {{name}}',
          welcome_sub: 'كمل ما تركته - كورساتك، أدواتك، ومجتمعك ينتظرك.',
          recent_courses: 'الكورسات الأخيرة',
          cta_secondary: 'عرض تفاصيل الكورس',
          vip_title: 'VIP تيليجرام',
          days_remaining: 'الأيام المتبقية',
          days: 'أيام',
          open_telegram: 'فتح تيليجرام',
          enrolled_courses: 'كورساتك',
          courses_enrolled: 'كورسات مسجلة',
        },
        time: {
          days_short: 'ي',
          hours_short: 'س',
          minutes_short: 'د',
          seconds_short: 'ث',
        },
        enrolled: {
          markets_title: "نظرة عامة على الأسواق",
          markets_sub: "رسوم بيانية مباشرة وقوائم مراقبة متكيّفة حسب أسلوبك",
          markets_tab_fx: 'الفوركس',
          markets_tab_cr: 'الكريبتو',
          tips_title: 'نصائح وحِيل',
          tip1: 'استخدم نسبة مخاطرة/عائد لا تقل عن 1:2.',
          tip2: 'انتظر إغلاق الشمعة؛ تجنّب مطاردة الظلال.',
          tip3: 'علّم مناطق الدعم/المقاومة على الأطر العالية أسبوعيًا ويوميًا.',
          tip4: 'احتفظ بدفتر تداول ووسّم النماذج.',
          tip5: 'ركّز على عدد قليل من الأزواج لتفهم تدفّقها.',
          tip6: 'تجنّب التداول أثناء الأخبار عالية التأثير إلا إذا كان مخططًا.',
          badge: 'لوحة التحكم التعليمية',
          headline: 'مرحبًا بعودتك — تقدّمك كله في مكان واحد.',
          subheadline:
            'تابع كورساتك، راقب الأسواق، وابقَ على اطّلاع على أهم الأخبار — في مساحة عمل واحدة مدعومة.',
          cta_primary: 'تابع من حيث توقفت',
          cta_secondary: 'عرض جميع البرامج',
          courses_title: 'تابع التعلّم',
          no_courses: 'لا توجد كورسات نشطة بعد.',
          news_title: 'أخبار وجدول زمني',
          news_helper:
            'أهم الأخبار الاقتصادية والفوركس والكريبتو التي تهم جلساتك.',
          badges_title: 'الشارات والإنجازات',
          offers_title: 'عروض وخصومات مخصّصة',
          offers_helper: 'مصمّمة بناءً على اشتراكاتك واهتماماتك',
          broker_title: 'تداول مع وسيطنا المفضّل',
          broker_sub: 'سبريد منخفض، تنفيذ ECN، وسحوبات سريعة.',
          broker_cta: 'انضم إلى وسيطنا',
          progress_complete: 'مكتمل',
          progress_not_started: 'لم يبدأ بعد',
        },
        stats: {
          students: "عدد الطلاب",
          profitability: "نسبة النجاح",
        },
        urgency: {
          kicker: "التسجيل في الكورس ينتهي خلال",
          enroll: "التسجيل الآن",
          talk: "تحدث مع مستشار",
        },
        promo: {
          kicker: "عرض خصم للكورس لفترة محدودة:",
          copy: "نسخ",
          details: "وفّر حتى 10% — استخدم هذا الكود عند الدفع قبل انتهاء الوقت.",
          kicker_late: "فاتك العرض؟",
          details_late: "استعمل هذا الكود عند الدفع."
        },
        trustpilot: {
          title: "محبوب من المتدرّبين — موثوق في التحليل",
          badge: "موثق من Trustpilot",
          headline1: "موثق من Trustpilot",
          ratingText1: "ممتاز • 4.8 من 5",
          reviewsCount1: "أكثر من 1,200 مراجعة",
          proofText1: "طلاب حقيقيون. نتائج حقيقية.",
          headline2: "تقييم عالٍ من المتعلمين",
          ratingText2: "4.9/5 متوسط تقييم المدربين",
          reviewsCount2: "ضمن أفضل 1٪ في الفئة",
          proofText2: "تعليقات موثقة بشكل مستقل.",
          headline3: "موثوق في منطقة الشرق الأوسط وشمال أفريقيا وخارجها",
          ratingText3: "مجتمع عالمي من المتعلمين",
          reviewsCount3: "ينمو كل أسبوع",
          proofText3: "شفافية يمكنك الوثوق بها."
        },
        faq: {
          title: "الأسئلة الشائعة",
          subtitle: "ابحث عن إجابات سريعة أدناه. ما زلت محتارًا؟ تواصل معنا — يسعدنا مساعدتك.",
          items: [
            { q: "لمن هذه البرامج؟", a: "من المبتدئين إلى المتعلمين المتقدمين الباحثين عن تدريب منظم وهادف." },
            { q: "كيف يتم تقديم الكورسات؟", a: "من خلال مجموعات تعليمية مباشرة ودروس ذاتية الإيقاع مع دعم المجتمع وموارد قابلة للتنزيل." },
            { q: "هل سأحصل على شهادة؟", a: "نعم، ستحصل على شهادة إتمام يمكنك مشاركتها على لينكدإن." },
            { q: "هل يمكنني التجربة قبل الالتزام؟", "a": "نحن نقدم معاينات ودروسًا تجريبية حتى تتمكن من الاستكشاف قبل التسجيل." }
          ]
        },
        benefits: {
          title: 'اختبر رحلة تعلم فريدة',
          one: 'مناهج يقودها خبراء',
          one_desc: 'مسارات منظمة من الأساسيات حتى الاستراتيجيات المتقدمة.',
          two: 'دروس عملية',
          two_desc: 'مشاريع ودراسات حالة لنتائج واقعية.',
          three: 'مجتمع مميز',
          three_desc: 'إرشاد وفعاليات وقنوات خاصة.',
          four: 'الشريعة الإسلامية',
          four_desc: 'جميع الدروس تعلّم استراتيجيات مطابقة للشريعة الإسلامية.',
        },
        features: {
          title: 'ما الذي يميز كورساتنا',
          one: 'من الأساسيات إلى الاحتراف',
          one_desc: 'من المفاهيم حتى المنهجيات المتقدمة.',
          two: 'تعلم بنظام الدفعات',
          two_desc: 'تعلّم مع الزملاء وبإرشاد المدرّسين.',
          three: 'مكتبة موارد',
          three_desc: 'قوالب وقوائم و ملفات لا مثيل لها.',
          four: 'شهادة إتمام',
          four_desc: 'اعرض إنجازك عند التخرج.',
        },
        courses: {
          title: 'خدماتنا',
          cta: 'انضم',
          view: 'عرض',
          no_courses: 'لا توجد كورسات حتى الآن.',
          no_subscriptions: 'لا توجد اشتراكات حتى الآن.',
          access: 'الوصول',
        },
        cta: {
          kicker: 'جاهز للتعلّم؟',
          title: 'ابدأ رحلتك التعليمية اليوم',
          subtitle: 'انضم إلى متعلمين حول العالم وادخل مكتبتنا المميزة.',
          primary: 'تصفح الكورسات',
          secondary: 'اتصل بنا',
          image_alt: 'ابدأ التداول — تعليم احترافي لكل المستويات',
        },
      },
      broker: {
        partner_label: "وسيط معرِّف",
        anax_brand: "شركة ANAX Capital",
        hero_title: "تداول مع وسيطنا المفضّل",
        hero_subtitle:
          "انضم إلى الوسيط عبر رابط IB الرسمي الخاص بنا لتحصل على ظروف تداول قريبة من طريقتنا الفعلية في التداول: سبريد منخفض، تنفيذ سريع ودعم بمستوى مؤسسي.",
        hero_point_1: "وسيط مرخّص وموثوق",
        hero_point_2: "مصمم للمتداولين النشطين",
        cta_primary: "افتح حساب حقيقي عبر رابط IB",
        cta_secondary: "ابدأ بحساب تجريبي",
        disclaimer_short:
          "تداول CFDs/الفوركس عالي المخاطر. لا تخاطر إلا برأس مال يمكنك تحمّل خسارته.",
        metric_spreads: "السبريد يبدأ من",
        metric_spreads_note: "على أزواج الفوركس الرئيسية",
        metric_leverage: "رافعة مالية حتى",
        metric_leverage_note: "تختلف حسب المنطقة والأداة",
        metric_execution: "متوسّط التنفيذ",
        metric_execution_note: "بنية تحتية منخفضة التأخير",
        metric_platforms: "المنصات",
        metric_platforms_note: "الجوال والويب",
        why_title: "لماذا تنضم لهذا الوسيط عبر رابط IB الخاص بنا؟",
        why_subtitle:
          "بتسجيلك عبر رابط IB الرسمي، تساعدنا على التفاوض على شروط أفضل مع الوسيط وفتح مزايا إضافية متوافقة مع طريقة التداول في promrkts.",
        benefit_spreads: "تسعير بأسلوب مؤسسي",
        benefit_spreads_desc:
          "سبريد منخفض وعمولات منافسة تناسب استراتيجيات اليومي والسوينغ التي ندرّسها.",
        benefit_execution: "تنفيذ سريع وزمن استجابة منخفض",
        benefit_execution_desc:
          "بنية تحتية محسّنة لتوجيه الأوامر بسرعة، حتى تكون تنفيذاتك قريبة مما نتوقعه في خطة التداول.",
        benefit_alignment: "متوافق مع نظامنا التعليمي",
        benefit_alignment_desc:
          "التعليم، التمويل، والتنفيذ يعملون معًا. احتكاك أقل وتركيز أكبر على التداول.",
        steps_title: "طريقة الانضمام عبر رابط IB",
        step_1: "اضغط على الزر بالأسفل لفتح صفحة التسجيل في الوسيط.",
        step_2: "أكمل نموذج التسجيل ببياناتك الشخصية.",
        step_3:
          "اختياري: تواصل مع الدعم برقم حسابك إذا رغبت أن نتأكد من ربط حسابك بالـ IB.",
        cta_again: "انضم إلى الوسيط عبر promrkts",
        risk_title: "تحذير المخاطر (مهم)",
        risk_1:
          "تداول العملات الأجنبية (FX) والعقود مقابل الفروقات والمشتقات ينطوي على مستوى عالٍ من المخاطر وقد لا يكون مناسبًا لجميع المستثمرين.",
        risk_2:
          "قد تخسر أكثر من استثمارك الأولي. تداول فقط بأموال يمكنك تحمّل خسارتها واستشر مستشاراً مالياً مستقلاً عند الحاجة.",
        risk_3:
          "بمتابعتك، فإنك تقر بأنك تفهم المخاطر وأن دورنا هو وسيط تعريفي (Introducing Broker) ولسنا الوسيط المنفّذ لحسابك.",
        anax: {
          hero_badge: "ANAX Capital Financial Markets LLC",
          hero_intro:
            "شركة ANAX Capital Financial Markets توفّر التداول في اسواق الفوركس الفوري، المشتقات خارج البورصة، المشتقات المتداولة في البورصة والأسهم العالمية للعملاء المؤهلين.",
          hero_intro_secondary:
            "تضمن البنية التحتية، وشركاء السيولة، والالتزام التنظيمي لدى ANAX تنفيذًا بمستوى مؤسسي للمتداولين في الإمارات والعالم.",
          cta_primary: "ابدأ التداول",
          cta_secondary: "جرّب الحساب التجريبي",
          why_title: "لماذا تختار ANAX Capital في الإمارات؟",
          why_intro:
            "بصفتها وسيط تنفيذ بفئة 1 لدى هيئة الأوراق المالية والسلع، تقدّم ANAX وصولاً متعدد الأصول تحت مظلة تنظيمية واحدة.",
          why_intro_secondary:
            "تحصل على تنفيذ شفاف، وسيولة عميقة، ودعم سريع مصمم للعملاء الأفراد والمؤسسات المؤهلين.",
          features: {
            multi_market: {
              title: "وصول متعدد للأسواق حول العالم",
              description:
                "تداول الفوركس، المعادن، الطاقة، المؤشرات، الأسهم والعقود المستقبلية مع سيولة مجمّعة وتنفيذ آمن.",
            },
            low_spreads: {
              title: "فروق أسعار منخفضة ورافعة مخصصة وعمولات صفرية",
              description:
                "تسعير تنافسي مع رافعة مالية مضبوطة حسب تصنيف العميل (حتى 1:400 للعملاء المؤهلين) ودون عمولات على معظم الحسابات.",
            },
            hassle_free: {
              title: "إيداعات وسحوبات سلسة",
              description:
                "شراكات مصرفية دولية تُسهّل معالجة التحويلات غالبًا خلال 24 ساعة مع الحفاظ على أعلى معايير الأمان.",
            },
            support: {
              title: "دعم مخصص ومتعدد اللغات على مدار الساعة",
              description:
                "يتوفر خبراء ANAX لمساعدتك في التسجيل، التمويل والمنصات في أي وقت حتى تركز على استراتيجيتك.",
            },
          },
          platform_title: "تجربة المنصات",
          platforms: {
            mt5: {
              title: "منصة MetaTrader 5 (MT5)",
              description:
                "وصول موحّد إلى الفوركس، الأسهم، السلع، المؤشرات والطاقة مع رسوم بيانية متقدمة وتداول آلي واجتماعي.",
            },
            app: {
              title: "تطبيق ANAX للتداول (قريبًا)",
              description:
                "تجربة جوال خاصة تقدّم تنفيذًا سريعًا وبيانات لحظية وإدارة آمنة عبر أجهزة متعددة.",
            },
            web: {
              title: "منصة الويب",
              description:
                "تداول مباشرة من المتصفح بدون تثبيت مع اتصال مؤسسي ورسوم بيانية متقدمة وعمق سوق حي.",
            },
          },
          steps_title: "ابدأ في 4 خطوات سهلة",
          steps: {
            register: {
              title: "سجّل",
              description: "املأ النموذج الإلكتروني البسيط لإنشاء ملفك.",
            },
            verify: {
              title: "تحقق",
              description: "حمّل مستندات اعرف عميلك (KYC) للحصول على الموافقة.",
            },
            fund: {
              title: "موّل",
              description: "أودع رأس المال بعد اكتمال الموافقة الرقابية.",
            },
            trade: {
              title: "تداول",
              description: "ادخل إلى أكثر من 1000 أداة بتنفيذ عالي الجودة.",
            },
          },
          support_title: "تمكين التداول بثقة ووعي",
          support: {
            efficient_onboarding: "تسجيل فعّال مع تدقيق صارم لمتطلبات KYC.",
            multilingual_support: "فرق دعم متعددة اللغات متاحة 24/7.",
            education_demo: "موارد تعليمية وحسابات تجريبية لكل المستويات.",
            secure_payments: "قنوات دفع آمنة وشفافة من حيث المدد الزمنية.",
          },
          disclaimer: {
            website:
              "إخلاء مسؤولية: شركة ANAX Capital Financial Markets LLC (ترخيص SCA رقم 20200000258) تقدّم خدمات تنفيذ فقط. المعلومات المقدَّمة ليست نصيحة استثمارية، ويتحمل العميل مسؤولية أبحاثه. تداول المنتجات ذات الرافعة المالية ينطوي على مخاطر مرتفعة وقد تتجاوز الخسائر رأس المال المستثمر.",
            restricted_regions:
              "تحذير المناطق المحظورة: لا تقدّم ANAX Capital خدماتها لمقيمي أفغانستان، الكونغو، هايتي، إيران، كينيا، لبنان، ليبيا، مالي، ميانمار، كوريا الشمالية، روسيا، الصومال، جنوب السودان، سوريا، فنزويلا، اليمن أو أي دولة يحظر فيها ذلك قانونيًا.",
            risk_warning:
              "تحذير المخاطر: تداول المنتجات المالية بالهامش يحمل مستوىً مرتفعًا من المخاطر وقد لا يناسب جميع المستثمرين. راجع أهدافك وتحمّلك للمخاطر وخبرتك قبل التداول، واستشر مستشارًا مستقلاً إذا لزم الأمر. تقدّم ANAX Capital خدمة تنفيذ فقط ولا تتحمّل مسؤولية نتائج التداول.",
          },
        },
      },
      courses: {
        tab: "كورسات التداول",
      },
      states: {
        loading: "جاري التحميل…",
        empty: "لا توجد كورسات حتى الآن."
      },
      errors: {
        load_failed: "فشل في تحميل الكورسات"
      },
      levels: {
        beginner: "مبتدئ",
        intermediate: "متوسط",
        advanced: "متقدم"
      },
      price: {
        usd: "دولار أمريكي {{value}}",
        usdt: "USDT {{value}}"
      },
      features: {
        title: 'لماذا نحن',
        pricing: {
          title: 'ضمان أفضل الأسعار',
          desc: 'وجدت سعراً أقل؟ سنطابقه ونمنحك خصماً إضافياً 5%'
        },
        support: {
          title: 'دعم مميز على مدار الساعة',
          desc: 'مستشارو سفر خبراء متاحون طوال اليوم'
        },
        rewards: {
          title: 'برنامج مكافآت النخبة',
          desc: 'اكسب نقاطاً مع كل حجز واحصل على مزايا حصرية'
        }
      },
      footer: {
        tagline: 'تعلم مهاراتك مع برامج مصممة لتحويل الطموح إلى خبرة.',
        rights: 'جميع الحقوق محفوظة.',
        courses: 'الكورسات',
        popular: 'كورسات شهيرة',
        new: 'الجديد والشائع',
        bundles: 'العروض',
        careers: 'الوظائف',
        press: 'الصحافة',
        support: 'الدعم',
        help: 'مركز المساعدة',
        contact: 'اتصل بنا',
        terms: 'الشروط',
        connect: 'تواصل',
        newsletter: 'النشرة البريدية',
        social: 'وسائل التواصل الاجتماعي',
        blog: 'المدونة',
        learn: 'تعلم',
        faq: 'الأسئلة الشائعة',
        policy: 'سياستنا',
        resources: 'الموارد',
        contact_us: 'اتصل بنا',
        company: 'شركة',
        about: 'عننا',
      },
      auth: {
        login: 'تسجيل الدخول',
        login_title: 'مرحباً بعودتك',
        login_subtitle: 'ادخل للوصول إلى أفضل الكورسات، اشارات تداول ممتازة ودعم مخصص',
        login_cta: 'تسجيل الدخول',
        no_account: 'ليس لديك حساب؟',
        join_us: 'انضم إلى promrkts',
        login_loading: 'جارٍ تسجيل الدخول…',
        login_error: 'فشل تسجيل الدخول',
        verify: 'تحقق',
        create_account_sub: 'احصل على أفضل الكورسات، اشارات تداول ممتازة ودعم مخصص',
        basic_info: 'معلومات أساسية',
        contact_info: 'معلومات الاتصال',
        additional_info: 'معلومات إضافية',
        open_whatsapp: 'فتح WhatsApp',
        whatsapp_required: 'رقم هاتفك يجب أن يكون مرتبطاً بـ WhatsApp لاستلام رمز التحقق.',
        send_confirmation: 'إرسال تأكيد البريد',
        email_sent: 'تم إرسال البريد الإلكتروني',
        email_code_placeholder: 'أدخل الرمز المكون من 6 أرقام',
        email_code_required: 'أدخل الرمز المكون من 6 أرقام',
        verify_email: 'تحقق',
        verify_email_title: 'تحقق من بريدك الإلكتروني',
        verify_email_instructions: 'أرسلنا رمزًا مكونًا من 6 أرقام إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.',
        email_verified: 'تم التحقق من البريد الإلكتروني',
        email_send_failed: 'فشل إرسال البريد الإلكتروني',
        email_verify_failed: 'فشل التحقق من البريد الإلكتروني',
        email_verify_required: 'يرجى التحقق من بريدك الإلكتروني.',
        resend_email: 'إعادة الإرسال',
        resend_in: 'إعادة الإرسال خلال',
        forgot_password: 'نسيت كلمة المرور؟',
        remember_me: 'تذكرني',

        register: 'إنشاء حساب',
        register_title: 'أنشئ حسابك',
        register_error: 'فشل إنشاء الحساب',
        registering: 'جارٍ إنشاء الحساب…',
        create_account: 'إنشاء حساب',
        already_have: 'لديك حساب بالفعل؟',
        have_account: 'لديك حساب؟',

        name: 'الاسم',
        name_placeholder: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        email_placeholder: 'you@example.com',
        password: 'كلمة المرور',
        password_placeholder: '٨ أحرف أو أكثر',
        phone: 'رقم الهاتف',
        phone_placeholder: 'ادخل رقم هاتفك بدون كود البلاد',

        account_type: 'نوع الحساب',
        send_otp: 'إرسال رمز التحقق',
        otp_sent: 'تم إرسال رمز التحقق',
        otp_placeholder: 'أدخل رمز التحقق',
        verified: 'تم التحقق',
        personal_account: 'شخصي',
        nationality: 'الجنسية',
        nationality_placeholder: 'الرجاء اختيار الجنسية',
        business_account: 'وكالة / أعمال',
        dob: 'تاريخ الميلاد',
        dob_placeholder: 'اليوم/الشهر/السنة',
        gender: 'الجنس',
        gender_placeholder: 'الرجاء اختيار الجنس',
        gender_male: 'ذكر',
        gender_female: 'أنثى',

        // Forgot / reset password flow
        forgot_title: 'نسيت كلمة المرور',
        forgot_subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.',
        forgot_cta: 'إرسال رابط إعادة التعيين',
        forgot_sent: 'تم إرسال رابط إعادة التعيين',
        forgot_sent_desc:
          'إذا كان هذا البريد موجوداً لدينا فقد أرسلنا رابط إعادة تعيين كلمة المرور. تحقق من بريدك الوارد.',
        forgot_error: 'فشل إرسال رابط إعادة التعيين',
        email_required: 'البريد الإلكتروني مطلوب لإرسال الرابط من جديد',

        reset_title: 'إعادة تعيين كلمة المرور',
        reset_subtitle: 'أدخل كلمة مرور جديدة لحسابك.',
        reset_cta: 'إعادة تعيين كلمة المرور',
        reset_success: 'تم تغيير كلمة المرور',
        reset_success_desc:
          'تم تحديث كلمة مرورك بنجاح. يرجى تسجيل الدخول بكلمة المرور الجديدة.',
        reset_error: 'فشل في إعادة تعيين كلمة المرور',

        reset_token: 'رمز إعادة التعيين',
        reset_token_placeholder: 'الصق الرمز هنا إذا لم تستخدم الرابط مباشرة',
        hide_token: 'إخفاء',
        enter_token: 'إدخال الرمز',
        using_link_token:
          'يتم استخدام الرمز من الرابط — يمكنك إدخال رمز مختلف يدوياً في الأسفل.',
        reset_token_expired_desc:
          'قد يكون رمز إعادة التعيين غير صالح أو منتهي الصلاحية. يمكنك طلب رمز جديد في الأسفل.',

        password_confirm: 'تأكيد كلمة المرور',
        password_min: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
        password_mismatch: 'كلمتا المرور غير متطابقتين',
        no_token: 'رمز إعادة التعيين مفقود',
        otp_required: 'أدخل رمز التحقق',
        otp_send_failed: 'فشل إرسال رمز التحقق',
        agree_required: 'يجب أن توافق على الشروط وإخلاء المسؤولية.',
        accept_terms: 'أوافق على الشروط والأحكام',
        view_terms: 'عرض الشروط',
        accept_disclaimer: 'أوافق على إخلاء المسؤولية',
        view_disclaimer: 'عرض إخلاء المسؤولية',
        otp_via_whatsapp: 'سيتم إرسال رمز التحقق عبر واتساب وليس رسالة نصية قصيرة (SMS).',
      },
      tooltip: {
        lightMode: 'الوضع الفاتح',
        darkMode: 'الوضع الداكن',
        logout: 'تسجيل الخروج',
      },
      aria: {
        toggleTheme: 'تبديل السمة',
        logout: 'تسجيل الخروج',
      }
    }
  },

  // === RUSSIAN ===
  ru: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'Поиск', enrolled: 'Мои курсы', signIn: 'Войти', signOut: 'Выйти', contact: 'Контакты' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'Главная' }, products: { title: 'Курсы' }, checkout: { title: 'Оформление' }, learn: { title: 'Обучение' }, enrolled: { title: 'Мои курсы' }, contact: { title: 'Контакты' }, login: { title: 'Вход' }, register: { title: 'Регистрация' }, dashboard: { title: 'Панель' }, progress: { title: 'Прогресс' }, faq: { title: 'FAQ' }, about: { title: 'О нас' } },
      auth: {
        login: 'Войти', login_title: 'С возвращением', login_subtitle: 'Получите доступ к премиум-курсам, сигналам и поддержке', login_cta: 'Войти', no_account: 'Нет аккаунта?', join_us: 'Присоединяйтесь к promrkts', login_loading: 'Вход...', login_error: 'Ошибка входа', forgot_password: 'Забыли пароль?', remember_me: 'Запомнить меня',
        register: 'Создать аккаунт', register_title: 'Создайте аккаунт', register_error: 'Ошибка регистрации', registering: 'Регистрация...', create_account: 'Создать аккаунт', already_have: 'Уже есть аккаунт?', have_account: 'Есть аккаунт?',
        name: 'Имя', name_placeholder: 'Полное имя', email: 'Эл. почта', email_placeholder: 'you@example.com', password: 'Пароль', password_placeholder: '8+ символов', password_confirm: 'Подтвердите пароль', password_min: 'Пароль должен содержать минимум 8 символов', password_mismatch: 'Пароли не совпадают',
        phone: 'Телефон', phone_placeholder: 'Введите номер без кода страны', phone_verified: 'Телефон подтвержден', phone_required: 'Введите номер телефона', phone_verify_required: 'Подтвердите телефон через OTP',
        verify_email_title: 'Подтвердите вашу почту', verify_email_instructions: 'Мы отправили 6-значный код на вашу почту. Проверьте входящие и спам.', verify_email: 'Подтвердить', email_code_placeholder: 'Введите 6-значный код', email_verified: 'Почта подтверждена', email_send_failed: 'Ошибка отправки письма', email_verify_failed: 'Ошибка подтверждения почты', email_verify_required: 'Подтвердите вашу почту', resend_email: 'Отправить повторно', resend_in: 'Повторно через',
        send_otp: 'Отправить код', otp_placeholder: 'Введите код', otp_sent: 'Код отправлен', otp_verify_failed: 'Ошибка проверки кода', otp_required: 'Введите код', otp_send_failed: 'Ошибка отправки кода', otp_via_whatsapp: 'Код будет отправлен через WhatsApp', verified: 'Подтверждено',
        nationality: 'Национальность', nationality_placeholder: 'Выберите страну', contact_info: 'Контактная информация', basic_info: 'Основная информация', additional_info: 'Дополнительная информация',
        dob: 'Дата рождения', gender: 'Пол', gender_male: 'Мужской', gender_female: 'Женский',
        accept_terms: 'Я принимаю Условия использования', accept_disclaimer: 'Я принимаю Отказ от ответственности', view_terms: 'Просмотреть условия', view_disclaimer: 'Просмотреть отказ', agree_required: 'Вы должны принять условия',
        forgot_title: 'Забыли пароль', forgot_subtitle: 'Введите email для сброса пароля', forgot_cta: 'Отправить ссылку', forgot_sent: 'Ссылка отправлена', forgot_error: 'Ошибка отправки',
        reset_title: 'Сброс пароля', reset_subtitle: 'Введите новый пароль', reset_cta: 'Сбросить пароль', reset_success: 'Пароль изменен', reset_error: 'Ошибка сброса',
        duplicate_email: 'Email уже зарегистрирован', error_underage: 'Вам должно быть минимум 18 лет', error_overage: 'Введите корректную дату рождения',
      },
      common: { select: 'Выбрать', save: 'Сохранить', close: 'Закрыть', loading: 'Загрузка...', confirm: 'Подтвердить', delete: 'Удалить', create: 'Создать', upload: 'Загрузить', prev: 'Назад', next: 'Далее', products: 'Продукты', email: 'Email', phone: 'Телефон', name: 'Имя', copy: 'Копировать', copied: 'Скопировано' },
      checkout: { title: 'Оформление заказа', subtitle: 'Безопасная оплата', free: 'Бесплатно', no_tier: 'Курс не выбран', already_enrolled: 'Вы уже записаны на этот курс', customer: { details: 'Данные покупателя', full_name: 'Полное имя', email: 'Email', country: 'Страна', pref_lang: 'Язык курса' }, lang: { en: 'Английский', ar: 'Арабский', fr: 'Французский', ru: 'Русский' }, payment: { title: 'Способ оплаты', usdt: 'USDT (TRC20)', card: 'Карта (Visa/Mastercard)' }, actions: { complete: 'Завершить покупку', back: 'Назад' }, summary: { title: 'Итого', course: 'Курс', subtotal: 'Подытог', taxes: 'Налоги', total: 'Итого' }, promo: { label: 'Промокод', placeholder: 'Введите код', confirm: 'Применить', applied: 'Промокод применен', not_applied: 'Промокод не применен' } },
      home: { hero: { title: 'Ваши партнеры в успехе', subtitle: 'Присоединяйтесь к 4200+ учеников', cta_primary: 'Начать обучение', cta_secondary: 'Подробнее о курсах' }, courses: { title: 'Наши услуги', cta: 'Записаться', view: 'Смотреть', no_courses: 'Нет доступных курсов' }, faq: { title: 'Часто задаваемые вопросы' }, benefits: { title: 'Уникальный опыт обучения' } },
      dashboard: { title: 'Панель управления', courses: 'Мои курсы', overview: 'Обзор', settings: 'Настройки', no_courses: 'У вас пока нет курсов', continue: 'Продолжить', empty: 'Нет курсов' },
      progress: { title: 'Мой прогресс', overview: 'Обзор', badges: 'Значки', leaderboard: 'Рейтинг', level: 'Уровень', xp: 'XP', streak: 'Серия', days: 'дней', completed: 'Завершено', in_progress: 'В процессе' },
      contact: { title: 'Связаться с нами', subtitle: 'Отправьте сообщение', name: 'Ваше имя', email: 'Email', message: 'Сообщение', send: 'Отправить', sent: 'Сообщение отправлено' },
      footer: { tagline: 'Повысьте свои навыки', rights: 'Все права защищены', about: 'О нас', contact: 'Контакты', terms: 'Условия', policy: 'Политика', faq: 'FAQ' },
      header: { hi: 'Привет, {{name}}', dashboard: 'Панель', path: 'Мой путь', account: 'Аккаунт' },
      actions: { refresh: 'Обновить', enroll: 'Записаться', confirm: 'Подтвердить', verify: 'Проверить' },
      errors: { load_failed: 'Ошибка загрузки' },
      celebration: { title: 'Запись подтверждена!', body: 'Поздравляем, вы записаны на {{course_name}}', cta: 'Перейти к курсам' },
      tooltip: { lightMode: 'Светлая тема', darkMode: 'Темная тема', logout: 'Выйти' },
      aria: { toggleTheme: 'Сменить тему', logout: 'Выйти' },
      spin: { error: 'Ошибка вращения', description: 'Вращайте колесо, чтобы выиграть скидку!', button: 'Крутить', won: 'Вы выиграли {{value}}% скидку!', code: 'Код:', valid: 'Используйте при оформлении. Действует 7 дней.', title: 'Крути и выигрывай', close: 'Закрыть' },
      learn: { loading: 'Загрузка курса...', course_fallback: 'Курс', actions: { my_courses: 'Мои курсы', mark_completed: 'Готово' }, completion: { marked: 'Отмечено как завершенное' }, instructor: { title: 'Преподаватель' }, materials: { title: 'Материалы курса', preview: 'Предпросмотр', trailer: 'Трейлер', telegram: 'Telegram группа', discord: 'Discord', empty: 'Материалы пока не опубликованы.' }, reviews: { title: 'Отзывы', loading: 'Загрузка отзывов...', leave: 'Оставить отзыв', submit: 'Отправить', thanks: 'Спасибо за отзыв!', empty: 'Отзывов пока нет.' }, certificate: { get: 'Получить сертификат', share: 'Поделиться', download: 'Скачать', copy: 'Копировать ссылку', copied: 'Ссылка скопирована' } },
      badges: { title: 'Значки', my_badges: 'Мои значки', all_badges: 'Все значки', unlocked: 'Разблокировано', locked: 'Заблокировано', no_badges_yet: 'Значков пока нет', complete_lessons: 'Завершайте уроки, чтобы получить значки!', rarity: { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' } },
      leaderboard: { title: 'Рейтинг', top_students: 'Лучшие ученики', rank: 'Место', student: 'Ученик', level: 'Уровень', xp: 'XP', you: 'Вы', top_3: 'Топ 3' },
      levels: { beginner: 'Начинающий', intermediate: 'Средний', advanced: 'Продвинутый' },
    }
  },

  // === CHINESE (Simplified) ===
  zh: {
    translation: {
      brand: 'promrkts',
      nav: { search: '搜索', enrolled: '我的课程', signIn: '登录', signOut: '退出', contact: '联系我们' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: '首页' }, products: { title: '课程' }, checkout: { title: '结账' }, learn: { title: '学习' }, enrolled: { title: '我的课程' }, contact: { title: '联系我们' }, login: { title: '登录' }, register: { title: '注册' }, dashboard: { title: '仪表板' }, progress: { title: '进度' }, faq: { title: '常见问题' }, about: { title: '关于我们' } },
      auth: {
        login: '登录', login_title: '欢迎回来', login_subtitle: '访问优质课程、精选信号和专属支持', login_cta: '登录', no_account: '没有账户？', join_us: '加入 promrkts', login_loading: '登录中...', login_error: '登录失败', forgot_password: '忘记密码？', remember_me: '记住我',
        register: '创建账户', register_title: '创建您的账户', register_error: '注册失败', registering: '注册中...', create_account: '创建账户', already_have: '已有账户？', have_account: '有账户？',
        name: '姓名', name_placeholder: '全名', email: '电子邮件', email_placeholder: 'you@example.com', password: '密码', password_placeholder: '8个以上字符', password_confirm: '确认密码', password_min: '密码至少8个字符', password_mismatch: '密码不匹配',
        phone: '电话', phone_placeholder: '输入号码（不含国家代码）', phone_verified: '电话已验证', phone_required: '请输入电话号码', phone_verify_required: '请通过OTP验证电话',
        verify_email_title: '验证您的邮箱', verify_email_instructions: '我们已向您的邮箱发送了6位验证码。请检查收件箱和垃圾邮件。', verify_email: '验证', email_code_placeholder: '输入6位验证码', email_verified: '邮箱已验证', email_send_failed: '发送邮件失败', email_verify_failed: '验证邮箱失败', email_verify_required: '请验证您的邮箱', resend_email: '重新发送', resend_in: '重新发送倒计时',
        send_otp: '发送验证码', otp_placeholder: '输入验证码', otp_sent: '验证码已发送', otp_verify_failed: '验证码验证失败', otp_required: '请输入验证码', otp_send_failed: '发送验证码失败', otp_via_whatsapp: '验证码将通过WhatsApp发送', verified: '已验证',
        nationality: '国籍', nationality_placeholder: '选择国家', contact_info: '联系信息', basic_info: '基本信息', additional_info: '附加信息',
        dob: '出生日期', gender: '性别', gender_male: '男', gender_female: '女',
        accept_terms: '我接受条款和条件', accept_disclaimer: '我接受免责声明', view_terms: '查看条款', view_disclaimer: '查看免责声明', agree_required: '您必须接受条款',
        forgot_title: '忘记密码', forgot_subtitle: '输入邮箱重置密码', forgot_cta: '发送链接', forgot_sent: '链接已发送', forgot_error: '发送失败',
        reset_title: '重置密码', reset_subtitle: '输入新密码', reset_cta: '重置密码', reset_success: '密码已更改', reset_error: '重置失败',
        duplicate_email: '邮箱已注册', error_underage: '您必须年满18岁', error_overage: '请输入有效的出生日期',
      },
      common: { select: '选择', save: '保存', close: '关闭', loading: '加载中...', confirm: '确认', delete: '删除', create: '创建', upload: '上传', prev: '上一页', next: '下一页', products: '产品', email: '邮箱', phone: '电话', name: '姓名', copy: '复制', copied: '已复制' },
      checkout: { title: '结账', subtitle: '安全支付', free: '免费', no_tier: '未选择课程', already_enrolled: '您已注册此课程', customer: { details: '客户信息', full_name: '全名', email: '邮箱', country: '国家', pref_lang: '课程语言' }, lang: { en: '英语', ar: '阿拉伯语', fr: '法语', zh: '中文' }, payment: { title: '支付方式', usdt: 'USDT (TRC20)', card: '银行卡 (Visa/Mastercard)' }, actions: { complete: '完成购买', back: '返回' }, summary: { title: '订单摘要', course: '课程', subtotal: '小计', taxes: '税费', total: '总计' }, promo: { label: '优惠码', placeholder: '输入优惠码', confirm: '应用', applied: '优惠码已应用', not_applied: '优惠码无效' } },
      home: { hero: { title: '您的成功伙伴', subtitle: '加入4200+学员', cta_primary: '开始学习', cta_secondary: '查看课程详情' }, courses: { title: '我们的服务', cta: '报名', view: '查看', no_courses: '暂无课程' }, faq: { title: '常见问题' }, benefits: { title: '独特的学习体验' } },
      dashboard: { title: '仪表板', courses: '我的课程', overview: '概览', settings: '设置', no_courses: '您还没有课程', continue: '继续', empty: '暂无课程' },
      progress: { title: '我的进度', overview: '概览', badges: '徽章', leaderboard: '排行榜', level: '等级', xp: 'XP', streak: '连续', days: '天', completed: '已完成', in_progress: '进行中' },
      contact: { title: '联系我们', subtitle: '发送消息', name: '您的姓名', email: '邮箱', message: '消息', send: '发送', sent: '消息已发送' },
      footer: { tagline: '提升您的技能', rights: '版权所有', about: '关于我们', contact: '联系我们', terms: '条款', policy: '隐私政策', faq: '常见问题' },
      header: { hi: '你好, {{name}}', dashboard: '仪表板', path: '我的路径', account: '账户' },
      actions: { refresh: '刷新', enroll: '报名', confirm: '确认', verify: '验证' },
      errors: { load_failed: '加载失败' },
      celebration: { title: '注册成功！', body: '恭喜，您已成功注册{{course_name}}', cta: '前往我的课程' },
      tooltip: { lightMode: '浅色模式', darkMode: '深色模式', logout: '退出' },
      aria: { toggleTheme: '切换主题', logout: '退出' },
      spin: { error: '抽奖失败', description: '转动轮盘赢取折扣！', button: '立即抽奖', won: '您赢得了{{value}}%折扣！', code: '代码：', valid: '结账时使用，7天内有效。', title: '转盘抽奖', close: '关闭' },
      learn: { loading: '加载课程中...', course_fallback: '课程', actions: { my_courses: '我的课程', mark_completed: '完成' }, completion: { marked: '已标记为完成' }, instructor: { title: '讲师' }, materials: { title: '课程材料', preview: '预览', trailer: '预告片', telegram: 'Telegram群组', discord: 'Discord', empty: '暂无材料。' }, reviews: { title: '评价', loading: '加载评价中...', leave: '留下评价', submit: '提交', thanks: '感谢您的评价！', empty: '暂无评价。' }, certificate: { get: '获取证书', share: '分享', download: '下载', copy: '复制链接', copied: '链接已复制' } },
      badges: { title: '徽章', my_badges: '我的徽章', all_badges: '所有徽章', unlocked: '已解锁', locked: '未解锁', no_badges_yet: '暂无徽章', complete_lessons: '完成课程以获得徽章！', rarity: { common: '普通', rare: '稀有', epic: '史诗', legendary: '传奇' } },
      leaderboard: { title: '排行榜', top_students: '优秀学员', rank: '排名', student: '学员', level: '等级', xp: 'XP', you: '您', top_3: '前三名' },
      levels: { beginner: '初级', intermediate: '中级', advanced: '高级' },
    }
  },

  // === PORTUGUESE ===
  pt: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'Pesquisar', enrolled: 'Meus Cursos', signIn: 'Entrar', signOut: 'Sair', contact: 'Contato' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'Início' }, products: { title: 'Cursos' }, checkout: { title: 'Checkout' }, learn: { title: 'Aprender' }, enrolled: { title: 'Meus Cursos' }, contact: { title: 'Contato' }, login: { title: 'Entrar' }, register: { title: 'Registrar' }, dashboard: { title: 'Painel' }, progress: { title: 'Progresso' }, faq: { title: 'FAQ' }, about: { title: 'Sobre' } },
      auth: {
        login: 'Entrar', login_title: 'Bem-vindo de volta', login_subtitle: 'Acesse cursos premium, sinais selecionados e suporte dedicado', login_cta: 'Entrar', no_account: 'Não tem conta?', join_us: 'Junte-se ao promrkts', login_loading: 'Entrando...', login_error: 'Falha no login', forgot_password: 'Esqueceu a senha?', remember_me: 'Lembrar-me',
        register: 'Criar conta', register_title: 'Crie sua conta', register_error: 'Falha no registro', registering: 'Registrando...', create_account: 'Criar conta', already_have: 'Já tem uma conta?', have_account: 'Tem conta?',
        name: 'Nome', name_placeholder: 'Nome completo', email: 'E-mail', email_placeholder: 'voce@exemplo.com', password: 'Senha', password_placeholder: '8+ caracteres', password_confirm: 'Confirmar senha', password_min: 'A senha deve ter pelo menos 8 caracteres', password_mismatch: 'As senhas não coincidem',
        phone: 'Telefone', phone_placeholder: 'Digite o número sem código do país', phone_verified: 'Telefone verificado', phone_required: 'Digite o número de telefone', phone_verify_required: 'Verifique o telefone via OTP',
        verify_email_title: 'Verifique seu e-mail', verify_email_instructions: 'Enviamos um código de 6 dígitos para seu e-mail. Verifique sua caixa de entrada e spam.', verify_email: 'Verificar', email_code_placeholder: 'Digite o código de 6 dígitos', email_verified: 'E-mail verificado', email_send_failed: 'Falha ao enviar e-mail', email_verify_failed: 'Falha ao verificar e-mail', email_verify_required: 'Verifique seu e-mail', resend_email: 'Reenviar', resend_in: 'Reenviar em',
        send_otp: 'Enviar código', otp_placeholder: 'Digite o código', otp_sent: 'Código enviado', otp_verify_failed: 'Falha na verificação', otp_required: 'Digite o código', otp_send_failed: 'Falha ao enviar código', otp_via_whatsapp: 'O código será enviado via WhatsApp', verified: 'Verificado',
        nationality: 'Nacionalidade', nationality_placeholder: 'Selecione o país', contact_info: 'Informações de contato', basic_info: 'Informações básicas', additional_info: 'Informações adicionais',
        dob: 'Data de nascimento', gender: 'Gênero', gender_male: 'Masculino', gender_female: 'Feminino',
        accept_terms: 'Aceito os Termos e Condições', accept_disclaimer: 'Aceito o Aviso Legal', view_terms: 'Ver termos', view_disclaimer: 'Ver aviso', agree_required: 'Você deve aceitar os termos',
        forgot_title: 'Esqueceu a senha', forgot_subtitle: 'Digite seu e-mail para redefinir', forgot_cta: 'Enviar link', forgot_sent: 'Link enviado', forgot_error: 'Falha ao enviar',
        reset_title: 'Redefinir senha', reset_subtitle: 'Digite uma nova senha', reset_cta: 'Redefinir', reset_success: 'Senha alterada', reset_error: 'Falha ao redefinir',
        duplicate_email: 'E-mail já registrado', error_underage: 'Você deve ter pelo menos 18 anos', error_overage: 'Digite uma data válida',
      },
      common: { select: 'Selecionar', save: 'Salvar', close: 'Fechar', loading: 'Carregando...', confirm: 'Confirmar', delete: 'Excluir', create: 'Criar', upload: 'Enviar', prev: 'Anterior', next: 'Próximo', products: 'Produtos', email: 'E-mail', phone: 'Telefone', name: 'Nome', copy: 'Copiar', copied: 'Copiado' },
      checkout: { title: 'Checkout', subtitle: 'Pagamento seguro', free: 'Grátis', no_tier: 'Nenhum curso selecionado', already_enrolled: 'Você já está inscrito', customer: { details: 'Dados do cliente', full_name: 'Nome completo', email: 'E-mail', country: 'País', pref_lang: 'Idioma do curso' }, lang: { en: 'Inglês', ar: 'Árabe', fr: 'Francês', pt: 'Português' }, payment: { title: 'Método de pagamento', usdt: 'USDT (TRC20)', card: 'Cartão (Visa/Mastercard)' }, actions: { complete: 'Finalizar compra', back: 'Voltar' }, summary: { title: 'Resumo', course: 'Curso', subtotal: 'Subtotal', taxes: 'Impostos', total: 'Total' }, promo: { label: 'Código promocional', placeholder: 'Digite o código', confirm: 'Aplicar', applied: 'Código aplicado', not_applied: 'Código inválido' } },
      home: { hero: { title: 'Seus parceiros no sucesso', subtitle: 'Junte-se a 4200+ alunos', cta_primary: 'Começar a aprender', cta_secondary: 'Ver detalhes' }, courses: { title: 'Nossos serviços', cta: 'Inscrever-se', view: 'Ver', no_courses: 'Nenhum curso disponível' }, faq: { title: 'Perguntas frequentes' }, benefits: { title: 'Experiência única de aprendizado' } },
      dashboard: { title: 'Painel', courses: 'Meus cursos', overview: 'Visão geral', settings: 'Configurações', no_courses: 'Você ainda não tem cursos', continue: 'Continuar', empty: 'Sem cursos' },
      progress: { title: 'Meu progresso', overview: 'Visão geral', badges: 'Distintivos', leaderboard: 'Ranking', level: 'Nível', xp: 'XP', streak: 'Sequência', days: 'dias', completed: 'Concluído', in_progress: 'Em andamento' },
      contact: { title: 'Fale conosco', subtitle: 'Envie uma mensagem', name: 'Seu nome', email: 'E-mail', message: 'Mensagem', send: 'Enviar', sent: 'Mensagem enviada' },
      footer: { tagline: 'Aprimore suas habilidades', rights: 'Todos os direitos reservados', about: 'Sobre', contact: 'Contato', terms: 'Termos', policy: 'Política', faq: 'FAQ' },
      header: { hi: 'Olá, {{name}}', dashboard: 'Painel', path: 'Meu caminho', account: 'Conta' },
      actions: { refresh: 'Atualizar', enroll: 'Inscrever-se', confirm: 'Confirmar', verify: 'Verificar' },
      errors: { load_failed: 'Falha ao carregar' },
      celebration: { title: 'Inscrição confirmada!', body: 'Parabéns, você está inscrito em {{course_name}}', cta: 'Ir para meus cursos' },
      tooltip: { lightMode: 'Modo claro', darkMode: 'Modo escuro', logout: 'Sair' },
      aria: { toggleTheme: 'Alternar tema', logout: 'Sair' },
      spin: { error: 'Falha ao girar', description: 'Gire a roleta para ganhar desconto!', button: 'Girar', won: 'Você ganhou {{value}}% de desconto!', code: 'Código:', valid: 'Use no checkout. Válido por 7 dias.', title: 'Gire e Ganhe', close: 'Fechar' },
      learn: { loading: 'Carregando curso...', course_fallback: 'Curso', actions: { my_courses: 'Meus Cursos', mark_completed: 'Concluído' }, completion: { marked: 'Marcado como concluído' }, instructor: { title: 'Instrutor' }, materials: { title: 'Materiais do Curso', preview: 'Prévia', trailer: 'Trailer', telegram: 'Grupo Telegram', discord: 'Discord', empty: 'Sem materiais ainda.' }, reviews: { title: 'Avaliações', loading: 'Carregando avaliações...', leave: 'Deixar avaliação', submit: 'Enviar', thanks: 'Obrigado pela avaliação!', empty: 'Sem avaliações ainda.' }, certificate: { get: 'Obter Certificado', share: 'Compartilhar', download: 'Baixar', copy: 'Copiar Link', copied: 'Link Copiado' } },
      badges: { title: 'Distintivos', my_badges: 'Meus Distintivos', all_badges: 'Todos os Distintivos', unlocked: 'Desbloqueado', locked: 'Bloqueado', no_badges_yet: 'Sem distintivos ainda', complete_lessons: 'Complete lições para ganhar distintivos!', rarity: { common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário' } },
      leaderboard: { title: 'Ranking', top_students: 'Melhores Alunos', rank: 'Posição', student: 'Aluno', level: 'Nível', xp: 'XP', you: 'Você', top_3: 'Top 3' },
      levels: { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' },
    }
  },

  // === SPANISH ===
  es: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'Buscar', enrolled: 'Mis Cursos', signIn: 'Iniciar sesión', signOut: 'Cerrar sesión', contact: 'Contacto' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'Inicio' }, products: { title: 'Cursos' }, checkout: { title: 'Pago' }, learn: { title: 'Aprender' }, enrolled: { title: 'Mis Cursos' }, contact: { title: 'Contacto' }, login: { title: 'Iniciar sesión' }, register: { title: 'Registrarse' }, dashboard: { title: 'Panel' }, progress: { title: 'Progreso' }, faq: { title: 'FAQ' }, about: { title: 'Nosotros' } },
      auth: {
        login: 'Iniciar sesión', login_title: 'Bienvenido de nuevo', login_subtitle: 'Accede a cursos premium, señales seleccionadas y soporte dedicado', login_cta: 'Iniciar sesión', no_account: '¿No tienes cuenta?', join_us: 'Únete a promrkts', login_loading: 'Iniciando sesión...', login_error: 'Error de inicio de sesión', forgot_password: '¿Olvidaste tu contraseña?', remember_me: 'Recuérdame',
        register: 'Crear cuenta', register_title: 'Crea tu cuenta', register_error: 'Error de registro', registering: 'Registrando...', create_account: 'Crear cuenta', already_have: '¿Ya tienes cuenta?', have_account: '¿Tienes cuenta?',
        name: 'Nombre', name_placeholder: 'Nombre completo', email: 'Correo electrónico', email_placeholder: 'tu@ejemplo.com', password: 'Contraseña', password_placeholder: '8+ caracteres', password_confirm: 'Confirmar contraseña', password_min: 'La contraseña debe tener al menos 8 caracteres', password_mismatch: 'Las contraseñas no coinciden',
        phone: 'Teléfono', phone_placeholder: 'Ingresa tu número sin código de país', phone_verified: 'Teléfono verificado', phone_required: 'Ingresa el número de teléfono', phone_verify_required: 'Verifica el teléfono vía OTP',
        verify_email_title: 'Verifica tu correo', verify_email_instructions: 'Enviamos un código de 6 dígitos a tu correo. Revisa tu bandeja de entrada y spam.', verify_email: 'Verificar', email_code_placeholder: 'Ingresa el código de 6 dígitos', email_verified: 'Correo verificado', email_send_failed: 'Error al enviar correo', email_verify_failed: 'Error al verificar correo', email_verify_required: 'Verifica tu correo', resend_email: 'Reenviar', resend_in: 'Reenviar en',
        send_otp: 'Enviar código', otp_placeholder: 'Ingresa el código', otp_sent: 'Código enviado', otp_verify_failed: 'Error de verificación', otp_required: 'Ingresa el código', otp_send_failed: 'Error al enviar código', otp_via_whatsapp: 'El código se enviará por WhatsApp', verified: 'Verificado',
        nationality: 'Nacionalidad', nationality_placeholder: 'Selecciona país', contact_info: 'Información de contacto', basic_info: 'Información básica', additional_info: 'Información adicional',
        dob: 'Fecha de nacimiento', gender: 'Género', gender_male: 'Masculino', gender_female: 'Femenino',
        accept_terms: 'Acepto los Términos y Condiciones', accept_disclaimer: 'Acepto el Descargo de responsabilidad', view_terms: 'Ver términos', view_disclaimer: 'Ver descargo', agree_required: 'Debes aceptar los términos',
        forgot_title: 'Olvidé mi contraseña', forgot_subtitle: 'Ingresa tu correo para restablecer', forgot_cta: 'Enviar enlace', forgot_sent: 'Enlace enviado', forgot_error: 'Error al enviar',
        reset_title: 'Restablecer contraseña', reset_subtitle: 'Ingresa una nueva contraseña', reset_cta: 'Restablecer', reset_success: 'Contraseña cambiada', reset_error: 'Error al restablecer',
        duplicate_email: 'Correo ya registrado', error_underage: 'Debes tener al menos 18 años', error_overage: 'Ingresa una fecha válida',
      },
      common: { select: 'Seleccionar', save: 'Guardar', close: 'Cerrar', loading: 'Cargando...', confirm: 'Confirmar', delete: 'Eliminar', create: 'Crear', upload: 'Subir', prev: 'Anterior', next: 'Siguiente', products: 'Productos', email: 'Correo', phone: 'Teléfono', name: 'Nombre', copy: 'Copiar', copied: 'Copiado' },
      checkout: { title: 'Pago', subtitle: 'Pago seguro', free: 'Gratis', no_tier: 'Ningún curso seleccionado', already_enrolled: 'Ya estás inscrito', customer: { details: 'Datos del cliente', full_name: 'Nombre completo', email: 'Correo', country: 'País', pref_lang: 'Idioma del curso' }, lang: { en: 'Inglés', ar: 'Árabe', fr: 'Francés', es: 'Español' }, payment: { title: 'Método de pago', usdt: 'USDT (TRC20)', card: 'Tarjeta (Visa/Mastercard)' }, actions: { complete: 'Completar compra', back: 'Volver' }, summary: { title: 'Resumen', course: 'Curso', subtotal: 'Subtotal', taxes: 'Impuestos', total: 'Total' }, promo: { label: 'Código promocional', placeholder: 'Ingresa el código', confirm: 'Aplicar', applied: 'Código aplicado', not_applied: 'Código inválido' } },
      home: { hero: { title: 'Tus socios en el éxito', subtitle: 'Únete a 4200+ estudiantes', cta_primary: 'Empezar a aprender', cta_secondary: 'Ver detalles' }, courses: { title: 'Nuestros servicios', cta: 'Inscribirse', view: 'Ver', no_courses: 'No hay cursos disponibles' }, faq: { title: 'Preguntas frecuentes' }, benefits: { title: 'Experiencia única de aprendizaje' } },
      dashboard: { title: 'Panel', courses: 'Mis cursos', overview: 'Resumen', settings: 'Configuración', no_courses: 'Aún no tienes cursos', continue: 'Continuar', empty: 'Sin cursos' },
      progress: { title: 'Mi progreso', overview: 'Resumen', badges: 'Insignias', leaderboard: 'Clasificación', level: 'Nivel', xp: 'XP', streak: 'Racha', days: 'días', completed: 'Completado', in_progress: 'En progreso' },
      contact: { title: 'Contáctanos', subtitle: 'Envía un mensaje', name: 'Tu nombre', email: 'Correo', message: 'Mensaje', send: 'Enviar', sent: 'Mensaje enviado' },
      footer: { tagline: 'Mejora tus habilidades', rights: 'Todos los derechos reservados', about: 'Nosotros', contact: 'Contacto', terms: 'Términos', policy: 'Política', faq: 'FAQ' },
      header: { hi: 'Hola, {{name}}', dashboard: 'Panel', path: 'Mi camino', account: 'Cuenta' },
      actions: { refresh: 'Actualizar', enroll: 'Inscribirse', confirm: 'Confirmar', verify: 'Verificar' },
      errors: { load_failed: 'Error al cargar' },
      celebration: { title: '¡Inscripción confirmada!', body: 'Felicidades, estás inscrito en {{course_name}}', cta: 'Ir a mis cursos' },
      tooltip: { lightMode: 'Modo claro', darkMode: 'Modo oscuro', logout: 'Salir' },
      aria: { toggleTheme: 'Cambiar tema', logout: 'Salir' },
      spin: { error: 'Error al girar', description: '¡Gira la ruleta para ganar descuento!', button: 'Girar', won: '¡Ganaste {{value}}% de descuento!', code: 'Código:', valid: 'Úsalo en el pago. Válido por 7 días.', title: 'Gira y Gana', close: 'Cerrar' },
      learn: { loading: 'Cargando curso...', course_fallback: 'Curso', actions: { my_courses: 'Mis Cursos', mark_completed: 'Completado' }, completion: { marked: 'Marcado como completado' }, instructor: { title: 'Instructor' }, materials: { title: 'Materiales del Curso', preview: 'Vista previa', trailer: 'Tráiler', telegram: 'Grupo Telegram', discord: 'Discord', empty: 'Sin materiales aún.' }, reviews: { title: 'Reseñas', loading: 'Cargando reseñas...', leave: 'Dejar reseña', submit: 'Enviar', thanks: '¡Gracias por tu reseña!', empty: 'Sin reseñas aún.' }, certificate: { get: 'Obtener Certificado', share: 'Compartir', download: 'Descargar', copy: 'Copiar Enlace', copied: 'Enlace Copiado' } },
      badges: { title: 'Insignias', my_badges: 'Mis Insignias', all_badges: 'Todas las Insignias', unlocked: 'Desbloqueado', locked: 'Bloqueado', no_badges_yet: 'Sin insignias aún', complete_lessons: '¡Completa lecciones para ganar insignias!', rarity: { common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' } },
      leaderboard: { title: 'Clasificación', top_students: 'Mejores Estudiantes', rank: 'Posición', student: 'Estudiante', level: 'Nivel', xp: 'XP', you: 'Tú', top_3: 'Top 3' },
      levels: { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' },
    }
  },

  // === HINDI ===
  hi: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'खोजें', enrolled: 'मेरे कोर्स', signIn: 'साइन इन', signOut: 'साइन आउट', contact: 'संपर्क' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'होम' }, products: { title: 'कोर्स' }, checkout: { title: 'चेकआउट' }, learn: { title: 'सीखें' }, enrolled: { title: 'मेरे कोर्स' }, contact: { title: 'संपर्क' }, login: { title: 'लॉगिन' }, register: { title: 'रजिस्टर' }, dashboard: { title: 'डैशबोर्ड' }, progress: { title: 'प्रगति' }, faq: { title: 'FAQ' }, about: { title: 'हमारे बारे में' } },
      auth: {
        login: 'लॉग इन', login_title: 'वापस स्वागत है', login_subtitle: 'प्रीमियम कोर्स, चुनिंदा सिग्नल और समर्पित सहायता प्राप्त करें', login_cta: 'साइन इन करें', no_account: 'खाता नहीं है?', join_us: 'promrkts से जुड़ें', login_loading: 'साइन इन हो रहा है...', login_error: 'लॉगिन विफल', forgot_password: 'पासवर्ड भूल गए?', remember_me: 'मुझे याद रखें',
        register: 'खाता बनाएं', register_title: 'अपना खाता बनाएं', register_error: 'पंजीकरण विफल', registering: 'पंजीकरण हो रहा है...', create_account: 'खाता बनाएं', already_have: 'पहले से खाता है?', have_account: 'खाता है?',
        name: 'नाम', name_placeholder: 'पूरा नाम', email: 'ईमेल', email_placeholder: 'you@example.com', password: 'पासवर्ड', password_placeholder: '8+ अक्षर', password_confirm: 'पासवर्ड की पुष्टि करें', password_min: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए', password_mismatch: 'पासवर्ड मेल नहीं खाते',
        phone: 'फ़ोन', phone_placeholder: 'देश कोड के बिना नंबर दर्ज करें', phone_verified: 'फ़ोन सत्यापित', phone_required: 'फ़ोन नंबर दर्ज करें', phone_verify_required: 'OTP से फ़ोन सत्यापित करें',
        verify_email_title: 'अपना ईमेल सत्यापित करें', verify_email_instructions: 'हमने आपके ईमेल पर 6 अंकों का कोड भेजा है। कृपया इनबॉक्स और स्पैम फ़ोल्डर जांचें।', verify_email: 'सत्यापित करें', email_code_placeholder: '6 अंकों का कोड दर्ज करें', email_verified: 'ईमेल सत्यापित', email_send_failed: 'ईमेल भेजने में विफल', email_verify_failed: 'ईमेल सत्यापन विफल', email_verify_required: 'अपना ईमेल सत्यापित करें', resend_email: 'पुनः भेजें', resend_in: 'पुनः भेजें',
        send_otp: 'कोड भेजें', otp_placeholder: 'कोड दर्ज करें', otp_sent: 'कोड भेजा गया', otp_verify_failed: 'सत्यापन विफल', otp_required: 'कोड दर्ज करें', otp_send_failed: 'कोड भेजने में विफल', otp_via_whatsapp: 'कोड WhatsApp से भेजा जाएगा', verified: 'सत्यापित',
        nationality: 'राष्ट्रीयता', nationality_placeholder: 'देश चुनें', contact_info: 'संपर्क जानकारी', basic_info: 'मूल जानकारी', additional_info: 'अतिरिक्त जानकारी',
        dob: 'जन्म तिथि', gender: 'लिंग', gender_male: 'पुरुष', gender_female: 'महिला',
        accept_terms: 'मैं नियम और शर्तें स्वीकार करता/करती हूं', accept_disclaimer: 'मैं अस्वीकरण स्वीकार करता/करती हूं', view_terms: 'शर्तें देखें', view_disclaimer: 'अस्वीकरण देखें', agree_required: 'आपको शर्तें स्वीकार करनी होंगी',
        forgot_title: 'पासवर्ड भूल गए', forgot_subtitle: 'रीसेट के लिए ईमेल दर्ज करें', forgot_cta: 'लिंक भेजें', forgot_sent: 'लिंक भेजा गया', forgot_error: 'भेजने में विफल',
        reset_title: 'पासवर्ड रीसेट करें', reset_subtitle: 'नया पासवर्ड दर्ज करें', reset_cta: 'रीसेट करें', reset_success: 'पासवर्ड बदला गया', reset_error: 'रीसेट विफल',
        duplicate_email: 'ईमेल पहले से पंजीकृत', error_underage: 'आपकी उम्र कम से कम 18 वर्ष होनी चाहिए', error_overage: 'वैध तिथि दर्ज करें',
      },
      common: { select: 'चुनें', save: 'सहेजें', close: 'बंद करें', loading: 'लोड हो रहा है...', confirm: 'पुष्टि करें', delete: 'हटाएं', create: 'बनाएं', upload: 'अपलोड', prev: 'पिछला', next: 'अगला', products: 'उत्पाद', email: 'ईमेल', phone: 'फ़ोन', name: 'नाम', copy: 'कॉपी', copied: 'कॉपी हुआ' },
      checkout: { title: 'चेकआउट', subtitle: 'सुरक्षित भुगतान', free: 'मुफ्त', no_tier: 'कोई कोर्स नहीं चुना', already_enrolled: 'आप पहले से नामांकित हैं', customer: { details: 'ग्राहक विवरण', full_name: 'पूरा नाम', email: 'ईमेल', country: 'देश', pref_lang: 'कोर्स भाषा' }, lang: { en: 'अंग्रेज़ी', ar: 'अरबी', fr: 'फ्रेंच', hi: 'हिंदी' }, payment: { title: 'भुगतान विधि', usdt: 'USDT (TRC20)', card: 'कार्ड (Visa/Mastercard)' }, actions: { complete: 'खरीद पूरी करें', back: 'वापस' }, summary: { title: 'सारांश', course: 'कोर्स', subtotal: 'उप-योग', taxes: 'कर', total: 'कुल' }, promo: { label: 'प्रोमो कोड', placeholder: 'कोड दर्ज करें', confirm: 'लागू करें', applied: 'कोड लागू', not_applied: 'अमान्य कोड' } },
      home: { hero: { title: 'सफलता में आपके साथी', subtitle: '4200+ छात्रों से जुड़ें', cta_primary: 'सीखना शुरू करें', cta_secondary: 'विवरण देखें' }, courses: { title: 'हमारी सेवाएं', cta: 'नामांकन', view: 'देखें', no_courses: 'कोई कोर्स उपलब्ध नहीं' }, faq: { title: 'अक्सर पूछे जाने वाले प्रश्न' }, benefits: { title: 'अनूठा सीखने का अनुभव' } },
      dashboard: { title: 'डैशबोर्ड', courses: 'मेरे कोर्स', overview: 'अवलोकन', settings: 'सेटिंग्स', no_courses: 'अभी तक कोई कोर्स नहीं', continue: 'जारी रखें', empty: 'कोई कोर्स नहीं' },
      footer: { tagline: 'अपने कौशल बढ़ाएं', rights: 'सर्वाधिकार सुरक्षित', about: 'हमारे बारे में', contact: 'संपर्क', terms: 'शर्तें', policy: 'नीति', faq: 'FAQ' },
      header: { hi: 'नमस्ते, {{name}}', dashboard: 'डैशबोर्ड', path: 'मेरा पथ', account: 'खाता' },
      actions: { refresh: 'रिफ्रेश', enroll: 'नामांकन', confirm: 'पुष्टि', verify: 'सत्यापित' },
      celebration: { title: 'नामांकन पुष्ट!', body: 'बधाई, आप {{course_name}} में नामांकित हैं', cta: 'मेरे कोर्स पर जाएं' },
      tooltip: { lightMode: 'लाइट मोड', darkMode: 'डार्क मोड', logout: 'लॉगआउट' },
      aria: { toggleTheme: 'थीम बदलें', logout: 'लॉगआउट' },
      spin: { error: 'स्पिन विफल', description: 'छूट जीतने के लिए व्हील घुमाएं!', button: 'स्पिन करें', won: 'आपने {{value}}% छूट जीती!', code: 'कोड:', valid: 'चेकआउट पर उपयोग करें। 7 दिनों के लिए मान्य।', title: 'स्पिन और जीतें', close: 'बंद करें' },
      learn: { loading: 'कोर्स लोड हो रहा है...', course_fallback: 'कोर्स', actions: { my_courses: 'मेरे कोर्स', mark_completed: 'पूर्ण' }, completion: { marked: 'पूर्ण के रूप में चिह्नित' }, instructor: { title: 'प्रशिक्षक' }, materials: { title: 'कोर्स सामग्री', preview: 'पूर्वावलोकन', trailer: 'ट्रेलर', telegram: 'टेलीग्राम ग्रुप', discord: 'डिस्कॉर्ड', empty: 'अभी तक कोई सामग्री नहीं।' }, reviews: { title: 'समीक्षाएं', loading: 'समीक्षाएं लोड हो रही हैं...', leave: 'समीक्षा दें', submit: 'जमा करें', thanks: 'आपकी समीक्षा के लिए धन्यवाद!', empty: 'अभी तक कोई समीक्षा नहीं।' }, certificate: { get: 'प्रमाणपत्र प्राप्त करें', share: 'साझा करें', download: 'डाउनलोड', copy: 'लिंक कॉपी करें', copied: 'लिंक कॉपी हुआ' } },
      badges: { title: 'बैज', my_badges: 'मेरे बैज', all_badges: 'सभी बैज', unlocked: 'अनलॉक', locked: 'लॉक', no_badges_yet: 'अभी तक कोई बैज नहीं', complete_lessons: 'बैज कमाने के लिए पाठ पूरे करें!', rarity: { common: 'सामान्य', rare: 'दुर्लभ', epic: 'महाकाव्य', legendary: 'पौराणिक' } },
      leaderboard: { title: 'लीडरबोर्ड', top_students: 'शीर्ष छात्र', rank: 'रैंक', student: 'छात्र', level: 'स्तर', xp: 'XP', you: 'आप', top_3: 'शीर्ष 3' },
      levels: { beginner: 'शुरुआती', intermediate: 'मध्यवर्ती', advanced: 'उन्नत' },
      progress: { title: 'मेरी प्रगति', overview: 'अवलोकन', badges: 'बैज', leaderboard: 'लीडरबोर्ड', level: 'स्तर', xp: 'XP', streak: 'स्ट्रीक', days: 'दिन', completed: 'पूर्ण', in_progress: 'प्रगति में' },
      errors: { load_failed: 'लोड विफल' },
    }
  },

  // === URDU ===
  ur: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'تلاش', enrolled: 'میرے کورسز', signIn: 'سائن ان', signOut: 'سائن آؤٹ', contact: 'رابطہ' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'ہوم' }, products: { title: 'کورسز' }, checkout: { title: 'چیک آؤٹ' }, learn: { title: 'سیکھیں' }, enrolled: { title: 'میرے کورسز' }, contact: { title: 'رابطہ' }, login: { title: 'لاگ ان' }, register: { title: 'رجسٹر' }, dashboard: { title: 'ڈیش بورڈ' }, progress: { title: 'پیش رفت' }, faq: { title: 'سوالات' }, about: { title: 'ہمارے بارے میں' } },
      auth: { login: 'لاگ ان', login_title: 'واپسی پر خوش آمدید', login_subtitle: 'پریمیم کورسز، منتخب سگنلز اور مخصوص سپورٹ تک رسائی حاصل کریں', login_cta: 'سائن ان کریں', no_account: 'اکاؤنٹ نہیں ہے؟', join_us: 'promrkts میں شامل ہوں', login_loading: 'سائن ان ہو رہا ہے...', login_error: 'لاگ ان ناکام', forgot_password: 'پاس ورڈ بھول گئے؟', remember_me: 'مجھے یاد رکھیں', register: 'اکاؤنٹ بنائیں', register_title: 'اپنا اکاؤنٹ بنائیں', register_error: 'رجسٹریشن ناکام', registering: 'رجسٹر ہو رہا ہے...', create_account: 'اکاؤنٹ بنائیں', already_have: 'پہلے سے اکاؤنٹ ہے؟', have_account: 'اکاؤنٹ ہے؟', name: 'نام', name_placeholder: 'پورا نام', email: 'ای میل', email_placeholder: 'you@example.com', password: 'پاس ورڈ', password_placeholder: '8+ حروف', password_confirm: 'پاس ورڈ کی تصدیق کریں', phone: 'فون', phone_placeholder: 'ملکی کوڈ کے بغیر نمبر درج کریں', verify_email_title: 'اپنا ای میل تصدیق کریں', verify_email_instructions: 'ہم نے آپ کے ای میل پر 6 ہندسوں کا کوڈ بھیجا ہے۔ براہ کرم ان باکس اور سپیم فولڈر چیک کریں۔', verify_email: 'تصدیق کریں', email_code_placeholder: '6 ہندسوں کا کوڈ درج کریں', email_verified: 'ای میل تصدیق شدہ', resend_email: 'دوبارہ بھیجیں', resend_in: 'دوبارہ بھیجیں', nationality: 'قومیت', nationality_placeholder: 'ملک منتخب کریں', contact_info: 'رابطہ کی معلومات', basic_info: 'بنیادی معلومات', additional_info: 'اضافی معلومات', accept_terms: 'میں شرائط و ضوابط قبول کرتا/کرتی ہوں', accept_disclaimer: 'میں دستبرداری قبول کرتا/کرتی ہوں', view_terms: 'شرائط دیکھیں', view_disclaimer: 'دستبرداری دیکھیں' },
      common: { select: 'منتخب کریں', save: 'محفوظ کریں', close: 'بند کریں', loading: 'لوڈ ہو رہا ہے...', confirm: 'تصدیق کریں', delete: 'حذف کریں', create: 'بنائیں', upload: 'اپ لوڈ', prev: 'پچھلا', next: 'اگلا', products: 'مصنوعات', email: 'ای میل', phone: 'فون', name: 'نام', copy: 'کاپی', copied: 'کاپی ہو گیا' },
      checkout: { title: 'چیک آؤٹ', subtitle: 'محفوظ ادائیگی', free: 'مفت', no_tier: 'کوئی کورس نہیں چنا', already_enrolled: 'آپ پہلے سے شامل ہیں', customer: { details: 'گاہک کی تفصیلات', full_name: 'پورا نام', email: 'ای میل', country: 'ملک', pref_lang: 'کورس کی زبان' }, lang: { en: 'انگریزی', ar: 'عربی', fr: 'فرانسیسی', ur: 'اردو' }, payment: { title: 'ادائیگی کا طریقہ', usdt: 'USDT (TRC20)', card: 'کارڈ (Visa/Mastercard)' }, actions: { complete: 'خرید مکمل کریں', back: 'واپس' }, summary: { title: 'خلاصہ', course: 'کورس', subtotal: 'ذیلی کل', taxes: 'ٹیکس', total: 'کل' }, promo: { label: 'پرومو کوڈ', placeholder: 'کوڈ درج کریں', confirm: 'لاگو کریں', applied: 'کوڈ لاگو', not_applied: 'غلط کوڈ' } },
      home: { hero: { title: 'کامیابی میں آپ کے ساتھی', subtitle: '4200+ طلباء سے شامل ہوں', cta_primary: 'سیکھنا شروع کریں', cta_secondary: 'تفصیلات دیکھیں' }, courses: { title: 'ہماری خدمات', cta: 'شامل ہوں', view: 'دیکھیں', no_courses: 'کوئی کورس دستیاب نہیں' }, faq: { title: 'اکثر پوچھے جانے والے سوالات' }, benefits: { title: 'منفرد سیکھنے کا تجربہ' } },
      dashboard: { title: 'ڈیش بورڈ', courses: 'میرے کورسز', overview: 'جائزہ', settings: 'سیٹنگز', no_courses: 'ابھی تک کوئی کورس نہیں', continue: 'جاری رکھیں', empty: 'کوئی کورس نہیں' },
      progress: { title: 'میری پیش رفت', overview: 'جائزہ', badges: 'بیجز', leaderboard: 'لیڈر بورڈ', level: 'سطح', xp: 'XP', streak: 'سلسلہ', days: 'دن', completed: 'مکمل', in_progress: 'جاری' },
      contact: { title: 'ہم سے رابطہ کریں', subtitle: 'پیغام بھیجیں', name: 'آپ کا نام', email: 'ای میل', message: 'پیغام', send: 'بھیجیں', sent: 'پیغام بھیج دیا گیا' },
      footer: { tagline: 'اپنی صلاحیتوں کو بہتر بنائیں', rights: 'جملہ حقوق محفوظ ہیں', about: 'ہمارے بارے میں', contact: 'رابطہ', terms: 'شرائط', policy: 'پالیسی', faq: 'سوالات' },
      header: { hi: 'آداب, {{name}}', dashboard: 'ڈیش بورڈ', path: 'میرا راستہ', account: 'اکاؤنٹ' },
      actions: { refresh: 'ریفریش', enroll: 'شامل ہوں', confirm: 'تصدیق', verify: 'تصدیق کریں' },
      errors: { load_failed: 'لوڈ ناکام' },
      celebration: { title: 'شمولیت کی تصدیق!', body: 'مبارک ہو، آپ {{course_name}} میں شامل ہیں', cta: 'میرے کورسز پر جائیں' },
      tooltip: { lightMode: 'لائٹ موڈ', darkMode: 'ڈارک موڈ', logout: 'لاگ آؤٹ' },
      aria: { toggleTheme: 'تھیم بدلیں', logout: 'لاگ آؤٹ' },
      spin: { error: 'گھمانا ناکام', description: 'رعایت جیتنے کے لیے وہیل گھمائیں!', button: 'گھمائیں', won: 'آپ نے {{value}}% رعایت جیتی!', code: 'کوڈ:', valid: 'چیک آؤٹ پر استعمال کریں۔ 7 دن کے لیے درست۔', title: 'گھمائیں اور جیتیں', close: 'بند کریں' },
      learn: { loading: 'کورس لوڈ ہو رہا ہے...', course_fallback: 'کورس', actions: { my_courses: 'میرے کورسز', mark_completed: 'مکمل' }, completion: { marked: 'مکمل کے طور پر نشان زد' }, instructor: { title: 'استاد' }, materials: { title: 'کورس مواد', preview: 'پیش نظارہ', trailer: 'ٹریلر', telegram: 'ٹیلیگرام گروپ', discord: 'ڈسکارڈ', empty: 'ابھی تک کوئی مواد نہیں۔' }, reviews: { title: 'جائزے', loading: 'جائزے لوڈ ہو رہے ہیں...', leave: 'جائزہ دیں', submit: 'جمع کریں', thanks: 'آپ کے جائزے کا شکریہ!', empty: 'ابھی تک کوئی جائزہ نہیں۔' }, certificate: { get: 'سرٹیفکیٹ حاصل کریں', share: 'شیئر کریں', download: 'ڈاؤن لوڈ', copy: 'لنک کاپی کریں', copied: 'لنک کاپی ہو گیا' } },
      badges: { title: 'بیجز', my_badges: 'میرے بیجز', all_badges: 'تمام بیجز', unlocked: 'ان لاک', locked: 'لاک', no_badges_yet: 'ابھی تک کوئی بیج نہیں', complete_lessons: 'بیجز کمانے کے لیے سبق مکمل کریں!', rarity: { common: 'عام', rare: 'نایاب', epic: 'شاندار', legendary: 'افسانوی' } },
      leaderboard: { title: 'لیڈر بورڈ', top_students: 'اعلی طلباء', rank: 'درجہ', student: 'طالب علم', level: 'سطح', xp: 'XP', you: 'آپ', top_3: 'ٹاپ 3' },
      levels: { beginner: 'ابتدائی', intermediate: 'درمیانی', advanced: 'اعلی' },
    }
  },

  // === GERMAN ===
  de: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'Suchen', enrolled: 'Meine Kurse', signIn: 'Anmelden', signOut: 'Abmelden', contact: 'Kontakt' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'Startseite' }, products: { title: 'Kurse' }, checkout: { title: 'Kasse' }, learn: { title: 'Lernen' }, enrolled: { title: 'Meine Kurse' }, contact: { title: 'Kontakt' }, login: { title: 'Anmelden' }, register: { title: 'Registrieren' }, dashboard: { title: 'Dashboard' }, progress: { title: 'Fortschritt' }, faq: { title: 'FAQ' }, about: { title: 'Über uns' } },
      auth: { login: 'Anmelden', login_title: 'Willkommen zurück', login_subtitle: 'Zugang zu Premium-Kursen, ausgewählten Signalen und dediziertem Support', login_cta: 'Anmelden', no_account: 'Kein Konto?', join_us: 'promrkts beitreten', login_loading: 'Anmeldung...', login_error: 'Anmeldung fehlgeschlagen', forgot_password: 'Passwort vergessen?', remember_me: 'Angemeldet bleiben', register: 'Konto erstellen', register_title: 'Erstellen Sie Ihr Konto', register_error: 'Registrierung fehlgeschlagen', registering: 'Registrierung...', create_account: 'Konto erstellen', already_have: 'Bereits ein Konto?', have_account: 'Haben Sie ein Konto?', name: 'Name', name_placeholder: 'Vollständiger Name', email: 'E-Mail', email_placeholder: 'sie@beispiel.com', password: 'Passwort', password_placeholder: '8+ Zeichen', password_confirm: 'Passwort bestätigen', password_min: 'Passwort muss mindestens 8 Zeichen haben', password_mismatch: 'Passwörter stimmen nicht überein', phone: 'Telefon', phone_placeholder: 'Nummer ohne Ländervorwahl eingeben', phone_verified: 'Telefon bestätigt', phone_required: 'Telefonnummer eingeben', verify_email_title: 'E-Mail bestätigen', verify_email_instructions: 'Wir haben einen 6-stelligen Code an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihren Posteingang und Spam-Ordner.', verify_email: 'Bestätigen', email_code_placeholder: '6-stelligen Code eingeben', email_verified: 'E-Mail bestätigt', resend_email: 'Erneut senden', resend_in: 'Erneut senden in', nationality: 'Nationalität', nationality_placeholder: 'Land auswählen', contact_info: 'Kontaktinformationen', basic_info: 'Grundinformationen', additional_info: 'Zusätzliche Informationen', dob: 'Geburtsdatum', gender: 'Geschlecht', gender_male: 'Männlich', gender_female: 'Weiblich', accept_terms: 'Ich akzeptiere die AGB', accept_disclaimer: 'Ich akzeptiere den Haftungsausschluss', view_terms: 'Bedingungen anzeigen', view_disclaimer: 'Haftungsausschluss anzeigen', agree_required: 'Sie müssen die Bedingungen akzeptieren', forgot_title: 'Passwort vergessen', forgot_subtitle: 'E-Mail eingeben zum Zurücksetzen', forgot_cta: 'Link senden', forgot_sent: 'Link gesendet', forgot_error: 'Senden fehlgeschlagen', reset_title: 'Passwort zurücksetzen', reset_subtitle: 'Neues Passwort eingeben', reset_cta: 'Zurücksetzen', reset_success: 'Passwort geändert', reset_error: 'Zurücksetzen fehlgeschlagen', duplicate_email: 'E-Mail bereits registriert', error_underage: 'Sie müssen mindestens 18 Jahre alt sein', error_overage: 'Gültiges Datum eingeben' },
      common: { select: 'Auswählen', save: 'Speichern', close: 'Schließen', loading: 'Laden...', confirm: 'Bestätigen', delete: 'Löschen', create: 'Erstellen', upload: 'Hochladen', prev: 'Zurück', next: 'Weiter', products: 'Produkte', email: 'E-Mail', phone: 'Telefon', name: 'Name', copy: 'Kopieren', copied: 'Kopiert' },
      checkout: { title: 'Kasse', subtitle: 'Sichere Zahlung', free: 'Kostenlos', no_tier: 'Kein Kurs ausgewählt', already_enrolled: 'Sie sind bereits eingeschrieben', customer: { details: 'Kundendaten', full_name: 'Vollständiger Name', email: 'E-Mail', country: 'Land', pref_lang: 'Kurssprache' }, lang: { en: 'Englisch', ar: 'Arabisch', fr: 'Französisch', de: 'Deutsch' }, payment: { title: 'Zahlungsmethode', usdt: 'USDT (TRC20)', card: 'Karte (Visa/Mastercard)' }, actions: { complete: 'Kauf abschließen', back: 'Zurück' }, summary: { title: 'Zusammenfassung', course: 'Kurs', subtotal: 'Zwischensumme', taxes: 'Steuern', total: 'Gesamt' }, promo: { label: 'Promo-Code', placeholder: 'Code eingeben', confirm: 'Anwenden', applied: 'Code angewendet', not_applied: 'Ungültiger Code' } },
      home: { hero: { title: 'Ihre Partner für Erfolg', subtitle: 'Schließen Sie sich 4200+ Lernenden an', cta_primary: 'Jetzt lernen', cta_secondary: 'Details ansehen' }, courses: { title: 'Unsere Dienste', cta: 'Einschreiben', view: 'Ansehen', no_courses: 'Keine Kurse verfügbar' }, faq: { title: 'Häufig gestellte Fragen' }, benefits: { title: 'Einzigartiges Lernerlebnis' } },
      dashboard: { title: 'Dashboard', courses: 'Meine Kurse', overview: 'Übersicht', settings: 'Einstellungen', no_courses: 'Noch keine Kurse', continue: 'Fortsetzen', empty: 'Keine Kurse' },
      progress: { title: 'Mein Fortschritt', overview: 'Übersicht', badges: 'Abzeichen', leaderboard: 'Rangliste', level: 'Level', xp: 'XP', streak: 'Serie', days: 'Tage', completed: 'Abgeschlossen', in_progress: 'In Bearbeitung' },
      contact: { title: 'Kontaktieren Sie uns', subtitle: 'Nachricht senden', name: 'Ihr Name', email: 'E-Mail', message: 'Nachricht', send: 'Senden', sent: 'Nachricht gesendet' },
      footer: { tagline: 'Verbessern Sie Ihre Fähigkeiten', rights: 'Alle Rechte vorbehalten', about: 'Über uns', contact: 'Kontakt', terms: 'AGB', policy: 'Datenschutz', faq: 'FAQ' },
      header: { hi: 'Hallo, {{name}}', dashboard: 'Dashboard', path: 'Mein Weg', account: 'Konto' },
      actions: { refresh: 'Aktualisieren', enroll: 'Einschreiben', confirm: 'Bestätigen', verify: 'Verifizieren' },
      errors: { load_failed: 'Laden fehlgeschlagen' },
      celebration: { title: 'Einschreibung bestätigt!', body: 'Herzlichen Glückwunsch, Sie sind in {{course_name}} eingeschrieben', cta: 'Zu meinen Kursen' },
      tooltip: { lightMode: 'Heller Modus', darkMode: 'Dunkler Modus', logout: 'Abmelden' },
      aria: { toggleTheme: 'Thema wechseln', logout: 'Abmelden' },
      spin: { error: 'Drehen fehlgeschlagen', description: 'Drehen Sie das Rad für einen Rabatt!', button: 'Drehen', won: 'Sie haben {{value}}% Rabatt gewonnen!', code: 'Code:', valid: 'An der Kasse verwenden. 7 Tage gültig.', title: 'Drehen & Gewinnen', close: 'Schließen' },
      learn: { loading: 'Kurs wird geladen...', course_fallback: 'Kurs', actions: { my_courses: 'Meine Kurse', mark_completed: 'Fertig' }, completion: { marked: 'Als abgeschlossen markiert' }, instructor: { title: 'Dozent' }, materials: { title: 'Kursmaterialien', preview: 'Vorschau', trailer: 'Trailer', telegram: 'Telegram-Gruppe', discord: 'Discord', empty: 'Noch keine Materialien.' }, reviews: { title: 'Bewertungen', loading: 'Bewertungen laden...', leave: 'Bewertung abgeben', submit: 'Absenden', thanks: 'Danke für Ihre Bewertung!', empty: 'Noch keine Bewertungen.' }, certificate: { get: 'Zertifikat erhalten', share: 'Teilen', download: 'Herunterladen', copy: 'Link kopieren', copied: 'Link kopiert' } },
      badges: { title: 'Abzeichen', my_badges: 'Meine Abzeichen', all_badges: 'Alle Abzeichen', unlocked: 'Freigeschaltet', locked: 'Gesperrt', no_badges_yet: 'Noch keine Abzeichen', complete_lessons: 'Lektionen abschließen für Abzeichen!', rarity: { common: 'Gewöhnlich', rare: 'Selten', epic: 'Episch', legendary: 'Legendär' } },
      leaderboard: { title: 'Rangliste', top_students: 'Top-Schüler', rank: 'Rang', student: 'Schüler', level: 'Level', xp: 'XP', you: 'Sie', top_3: 'Top 3' },
      levels: { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Experte' },
    }
  },

  // === DUTCH ===
  nl: {
    translation: {
      brand: 'promrkts',
      nav: { search: 'Zoeken', enrolled: 'Mijn Cursussen', signIn: 'Inloggen', signOut: 'Uitloggen', contact: 'Contact' },
      meta: { brand: 'promrkts', default: { title: 'promrkts' }, home: { title: 'Home' }, products: { title: 'Cursussen' }, checkout: { title: 'Afrekenen' }, learn: { title: 'Leren' }, enrolled: { title: 'Mijn Cursussen' }, contact: { title: 'Contact' }, login: { title: 'Inloggen' }, register: { title: 'Registreren' }, dashboard: { title: 'Dashboard' }, progress: { title: 'Voortgang' }, faq: { title: 'FAQ' }, about: { title: 'Over ons' } },
      auth: { login: 'Inloggen', login_title: 'Welkom terug', login_subtitle: 'Toegang tot premium cursussen, geselecteerde signalen en toegewijde ondersteuning', login_cta: 'Inloggen', no_account: 'Geen account?', join_us: 'Word lid van promrkts', login_loading: 'Inloggen...', login_error: 'Inloggen mislukt', forgot_password: 'Wachtwoord vergeten?', remember_me: 'Onthoud mij', register: 'Account aanmaken', register_title: 'Maak uw account aan', register_error: 'Registratie mislukt', registering: 'Registreren...', create_account: 'Account aanmaken', already_have: 'Al een account?', have_account: 'Heeft u een account?', name: 'Naam', name_placeholder: 'Volledige naam', email: 'E-mail', email_placeholder: 'u@voorbeeld.com', password: 'Wachtwoord', password_placeholder: '8+ tekens', password_confirm: 'Wachtwoord bevestigen', password_min: 'Wachtwoord moet minimaal 8 tekens bevatten', password_mismatch: 'Wachtwoorden komen niet overeen', phone: 'Telefoon', phone_placeholder: 'Voer nummer in zonder landcode', phone_verified: 'Telefoon geverifieerd', phone_required: 'Voer telefoonnummer in', verify_email_title: 'Verifieer uw e-mail', verify_email_instructions: 'We hebben een 6-cijferige code naar uw e-mail gestuurd. Controleer uw inbox en spam-map.', verify_email: 'Verifiëren', email_code_placeholder: 'Voer 6-cijferige code in', email_verified: 'E-mail geverifieerd', resend_email: 'Opnieuw verzenden', resend_in: 'Opnieuw verzenden over', nationality: 'Nationaliteit', nationality_placeholder: 'Selecteer land', contact_info: 'Contactgegevens', basic_info: 'Basisinformatie', additional_info: 'Aanvullende informatie', dob: 'Geboortedatum', gender: 'Geslacht', gender_male: 'Man', gender_female: 'Vrouw', accept_terms: 'Ik accepteer de Algemene Voorwaarden', accept_disclaimer: 'Ik accepteer de Disclaimer', view_terms: 'Voorwaarden bekijken', view_disclaimer: 'Disclaimer bekijken', agree_required: 'U moet de voorwaarden accepteren', forgot_title: 'Wachtwoord vergeten', forgot_subtitle: 'Voer e-mail in om te resetten', forgot_cta: 'Link verzenden', forgot_sent: 'Link verzonden', forgot_error: 'Verzenden mislukt', reset_title: 'Wachtwoord resetten', reset_subtitle: 'Voer nieuw wachtwoord in', reset_cta: 'Resetten', reset_success: 'Wachtwoord gewijzigd', reset_error: 'Resetten mislukt', duplicate_email: 'E-mail al geregistreerd', error_underage: 'U moet minimaal 18 jaar oud zijn', error_overage: 'Voer geldige datum in' },
      common: { select: 'Selecteren', save: 'Opslaan', close: 'Sluiten', loading: 'Laden...', confirm: 'Bevestigen', delete: 'Verwijderen', create: 'Aanmaken', upload: 'Uploaden', prev: 'Vorige', next: 'Volgende', products: 'Producten', email: 'E-mail', phone: 'Telefoon', name: 'Naam', copy: 'Kopiëren', copied: 'Gekopieerd' },
      checkout: { title: 'Afrekenen', subtitle: 'Veilige betaling', free: 'Gratis', no_tier: 'Geen cursus geselecteerd', already_enrolled: 'U bent al ingeschreven', customer: { details: 'Klantgegevens', full_name: 'Volledige naam', email: 'E-mail', country: 'Land', pref_lang: 'Cursustaal' }, lang: { en: 'Engels', ar: 'Arabisch', fr: 'Frans', nl: 'Nederlands' }, payment: { title: 'Betaalmethode', usdt: 'USDT (TRC20)', card: 'Kaart (Visa/Mastercard)' }, actions: { complete: 'Aankoop voltooien', back: 'Terug' }, summary: { title: 'Samenvatting', course: 'Cursus', subtotal: 'Subtotaal', taxes: 'Belastingen', total: 'Totaal' }, promo: { label: 'Promotiecode', placeholder: 'Voer code in', confirm: 'Toepassen', applied: 'Code toegepast', not_applied: 'Ongeldige code' } },
      home: { hero: { title: 'Uw partners in succes', subtitle: 'Sluit u aan bij 4200+ studenten', cta_primary: 'Begin met leren', cta_secondary: 'Details bekijken' }, courses: { title: 'Onze diensten', cta: 'Inschrijven', view: 'Bekijken', no_courses: 'Geen cursussen beschikbaar' }, faq: { title: 'Veelgestelde vragen' }, benefits: { title: 'Unieke leerervaring' } },
      dashboard: { title: 'Dashboard', courses: 'Mijn cursussen', overview: 'Overzicht', settings: 'Instellingen', no_courses: 'Nog geen cursussen', continue: 'Doorgaan', empty: 'Geen cursussen' },
      progress: { title: 'Mijn voortgang', overview: 'Overzicht', badges: 'Badges', leaderboard: 'Ranglijst', level: 'Niveau', xp: 'XP', streak: 'Reeks', days: 'dagen', completed: 'Voltooid', in_progress: 'Bezig' },
      contact: { title: 'Neem contact op', subtitle: 'Stuur een bericht', name: 'Uw naam', email: 'E-mail', message: 'Bericht', send: 'Verzenden', sent: 'Bericht verzonden' },
      footer: { tagline: 'Verbeter uw vaardigheden', rights: 'Alle rechten voorbehouden', about: 'Over ons', contact: 'Contact', terms: 'Voorwaarden', policy: 'Privacy', faq: 'FAQ' },
      header: { hi: 'Hallo, {{name}}', dashboard: 'Dashboard', path: 'Mijn pad', account: 'Account' },
      actions: { refresh: 'Vernieuwen', enroll: 'Inschrijven', confirm: 'Bevestigen', verify: 'Verifiëren' },
      errors: { load_failed: 'Laden mislukt' },
      celebration: { title: 'Inschrijving bevestigd!', body: 'Gefeliciteerd, u bent ingeschreven voor {{course_name}}', cta: 'Naar mijn cursussen' },
      tooltip: { lightMode: 'Lichte modus', darkMode: 'Donkere modus', logout: 'Uitloggen' },
      aria: { toggleTheme: 'Thema wisselen', logout: 'Uitloggen' },
      spin: { error: 'Draaien mislukt', description: 'Draai het wiel voor korting!', button: 'Draaien', won: 'U heeft {{value}}% korting gewonnen!', code: 'Code:', valid: 'Gebruik bij afrekenen. 7 dagen geldig.', title: 'Draai & Win', close: 'Sluiten' },
      learn: { loading: 'Cursus laden...', course_fallback: 'Cursus', actions: { my_courses: 'Mijn Cursussen', mark_completed: 'Voltooid' }, completion: { marked: 'Gemarkeerd als voltooid' }, instructor: { title: 'Instructeur' }, materials: { title: 'Cursusmateriaal', preview: 'Voorbeeld', trailer: 'Trailer', telegram: 'Telegram-groep', discord: 'Discord', empty: 'Nog geen materiaal.' }, reviews: { title: 'Beoordelingen', loading: 'Beoordelingen laden...', leave: 'Beoordeling achterlaten', submit: 'Verzenden', thanks: 'Bedankt voor uw beoordeling!', empty: 'Nog geen beoordelingen.' }, certificate: { get: 'Certificaat ophalen', share: 'Delen', download: 'Downloaden', copy: 'Link kopiëren', copied: 'Link gekopieerd' } },
      badges: { title: 'Badges', my_badges: 'Mijn Badges', all_badges: 'Alle Badges', unlocked: 'Ontgrendeld', locked: 'Vergrendeld', no_badges_yet: 'Nog geen badges', complete_lessons: 'Voltooi lessen om badges te verdienen!', rarity: { common: 'Gewoon', rare: 'Zeldzaam', epic: 'Episch', legendary: 'Legendarisch' } },
      leaderboard: { title: 'Ranglijst', top_students: 'Top Studenten', rank: 'Rang', student: 'Student', level: 'Niveau', xp: 'XP', you: 'U', top_3: 'Top 3' },
      levels: { beginner: 'Beginner', intermediate: 'Gevorderd', advanced: 'Expert' },
    }
  }
};

/**
 * NEW PAGE STRINGS (Learn, Legal, Company)
 * These are merged into the same "translation" namespace so you don’t
 * have to change any provider config. Safe alongside your current keys.
 */
const NEW_PAGE_STRINGS = {
  en: {
    translation: {
      common: {
        view: "View",
        explore: "Explore",
        downloads: "Downloads",
        read_more: "Read more",
        enroll_now: "Enroll now",
        free: "Free",
        anonymous: "Student",
      },
      learn: {
        resources: {
          title: "Learning Resources",
          subtitle:
            "Premium guides, checklists, and video breakdowns to accelerate your progress.",
          guides: "Step-by-Step Guides",
          guides_desc:
            "Structured playbooks from fundamentals to advanced strategies.",
          videos: "Video Library",
          videos_desc:
            "Concise lessons and deep-dives with real market examples.",
          downloads: "Downloads",
          downloads_desc: "Checklists, templates, and ready-to-use tools.",
          research: "Research Notes",
          research_desc: "Curated notes and frameworks used by our mentors.",
          pitch:
            "Get the exact curriculum our mentors use with real-world scenarios, practical downloads, and actionable frameworks. Start free, upgrade anytime.",
          guarantee: "Mentor-reviewed",
          guarantee_value: "Actionable & vetted",
          time_to_complete: "Avg. completion",
          time_value: "2–6 weeks",
          image_alt: "Students learning with structured course content",
          point1:
            "Practical, not theoretical: real examples and step-by-step walkthroughs.",
          point2: "Cohort access & weekly Q&A with mentors.",
          point3: "Lifetime updates to materials.",
          point4: "Certificate of completion to showcase your skills.",
          syllabus: "Course Syllabus (Preview)",
          module1: "Foundations & Mindset",
          module2: "Core Strategies & Risk",
          module3: "Tools, Templates & Automation",
          module4: "Case Studies & Live Reviews",
          testimonials_title: "Loved by learners",
          testimonial1:
            "The content is gold. I moved from guessing to having a plan.",
          testimonial2:
            "Clear, concise, and practical. The templates saved me weeks.",
          testimonial3:
            "I finally understand the why behind decisions.",
          role1: "Entrepreneur",
          role2: "Analyst",
          role3: "Student",
          cta_banner:
            "Ready to go deeper? Join the full course and get all resources unlocked.",
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know before you enroll.",
          q1: "How long do I keep access?",
          a1: "Lifetime access to the content and future updates.",
          q2: "Do I get a certificate?",
          a2: "Yes, a downloadable certificate upon completion.",
          q3: "Is there support?",
          a3: "24/7 support via chat and priority email.",
        },
      },
      legal: {
        refund: {
          title: "Refund Policy",
          p1: "If you’re not satisfied within 7 days of purchase, contact support for a full refund (terms apply).",
          p2: "Refunds exclude cases of content misuse, sharing, or policy abuse.",
          p3: "To initiate a refund, email support with your order ID and reason.",
          eligibility: "Eligibility: first-time purchase of a given product/tier, and meaningful usage under fair-use limits.",
          exclusions: "Exclusions: content scraping/sharing, downloading a substantial portion of materials, account sharing, or policy abuse.",
          digital: "Because access is digital, refunds may be prorated or denied if significant content has been consumed.",
          method: "Refunds are issued in USDT to the original network used for payment. Network fees are non-refundable.",
          timeline: "Processing time: up to 10 business days after approval, excluding on-chain network delays.",
          process: "To initiate a refund, email support with your order ID, wallet address, and reason."
        },
        terms: {
          title: "Terms & Conditions",
          last_updated: "December 18th, 2025",
          intro:
            "By using this platform, enrolling in our courses, or purchasing digital content, you agree to these terms and conditions. Please read them carefully before proceeding.",
          scope: {
            title: "Scope",
            p1: "These terms govern your use of our educational services, courses, subscriptions, and community access focused on forex and crypto trading education.",
            p2: "All content provided is for educational purposes only and does not constitute financial or investment advice."
          },
          use: {
            title: "Use of Content & Intellectual Property",
            p1: "You are granted a personal, non-transferable, limited license to access and use our educational materials. You may not share, resell, distribute, or publicly display our content without written permission.",
            p2: "All course videos, PDFs, and templates are copyrighted material. Unauthorized use may result in account termination and legal action."
          },
          conduct: {
            title: "User Conduct",
            p1: "You agree not to misuse the platform, engage in fraudulent activity, share your account, or attempt to gain unauthorized access to our systems.",
            p2: "We reserve the right to suspend or terminate accounts involved in content piracy, abusive behavior, or any activity that compromises platform integrity."
          },
          payments: {
            title: "Payments & Refunds",
            p1: "All payments are processed exclusively in USDT. Please review our Refund Policy for detailed terms on eligibility and processing times.",
            p2: "You are responsible for verifying payment addresses and network selection before sending crypto transactions."
          },
          disclaimer: {
            title: "Risk Disclosure & Educational Purpose",
            p1: "Trading forex, cryptocurrencies, and financial markets involves significant risk. Past performance does not guarantee future results.",
            p2: "Our courses, templates, and examples are purely educational and do not constitute financial advice, trading recommendations, or investment guidance.",
            p3: "You acknowledge that you are solely responsible for any trading decisions made based on information from our materials."
          },
          liability: {
            title: "Limitation of Liability",
            p1: "We are not liable for any losses, damages, or claims arising from your use of our platform or the application of our educational content.",
            p2: "All information is provided 'as is' without warranties of accuracy, completeness, or fitness for purpose."
          },
          modifications: {
            title: "Changes to Terms",
            p1: "We may update these terms periodically to reflect new features, laws, or business practices. Continued use after updates implies acceptance."
          }
        },
        payments: {
          usdt_only: "We only accept USDT for now as we want to offer the fastest and most trusted crypto for payments and to get our students involved in the crypto space early on. Please bear with us as we expand our payments offerings.",
          nb: "NB: We only accept TRC20 to minimise fees on our students and we do require a tx hash upon payment completion to verify each payment. Thank you for your cooperation."
        },
        privacy_refund: {
          title: "Privacy & Refund Policy",
          last_updated: "December 18th, 2025",
          intro: "This policy explains how we handle your data and how refunds work for our educational products and subscriptions focused on forex and crypto trading.",
          scope: {
            title: "Scope",
            p1: "These terms apply to all courses, live sessions, templates, and membership tiers available on our platform.",
            p2: "Financial markets are risky. We provide education only—no investment advice, signals, or portfolio management."
          },
          payments: {
            title: "Payments & Pricing (USDT Only)",
            p1: "All sales are processed exclusively in USDT. Where supported, we accept USDT on TRC20 network only.",
            li1: "Prices may be displayed in your local currency for convenience, but settlement is in USDT.",
            li2: "Network fees and on-chain confirmation times are outside our control.",
            li3: "You are responsible for sending the exact amount to the correct chain address. Mis-sent funds may be irrecoverable.",
            note: "Note",
            note_text: "Payment confirmations occur after sufficient on-chain confirmations."
          },
          access: {
            title: "Access, Renewals & Cancellations",
            li1: "Access to digital content is personal and non-transferable.",
            li2: "Subscriptions renew automatically unless cancelled before the next billing date.",
            li3: "Cancellation stops future charges; it does not retroactively refund prior periods."
          },
          chargebacks: {
            title: "Chargebacks & Disputes",
            p1: "Please contact us first to resolve billing or access issues. Unauthorized disputes may result in account suspension."
          }
        },
        privacy: {
          data: {
            title: "Privacy: Data We Collect",
            account: "Account data: name, email, and login identifiers.",
            billing: "Billing metadata: transaction IDs, wallet address, and plan details (no private keys are ever collected).",
            usage: "Usage analytics: page views, progress, device information, and approximate location (for fraud prevention and product improvement)."
          },
          use: {
            title: "How We Use Your Data",
            provide: "To provide and improve course content, track progress, and deliver support.",
            security: "To protect against fraud, abuse, and unauthorized sharing.",
            comms: "To send essential service emails. You can opt out of non-essential marketing messages."
          },
          cookies: {
            title: "Cookies, Analytics & Third-Party Services",
            p1: "We use cookies and similar technologies for authentication, preferences, and analytics. Some third-party providers may process limited personal data according to their own policies."
          },
          security: {
            title: "Data Retention & Security",
            retention: "We retain data only as long as necessary for the purposes described or as required by law.",
            measures: "We apply technical and organizational safeguards, but no method is 100% secure."
          },
          rights: {
            title: "Your Rights",
            p1: "Subject to local laws, you may request access, correction, deletion, or portability of your data. We may ask for verification before fulfilling requests."
          }
        },
        common: {
          last_updated: "Last updated",
          download_pdf: "Download as PDF",
          contact: "Contact",
          contact_text: "For privacy questions or refund requests, reach us at ",
          support_email: "support@promrkts.com",
          disclaimer: "Nothing here is financial advice. Trading involves substantial risk of loss. Educational content is provided as-is without guarantees."
        }
      },
      errors: {
        404: {
          title: "Page not found",
          subtitle: "The page you’re looking for isn’t available, or our servers had a brief hiccup.",
          code: "Error",
          trace: "Trace ID",
          cta_home: "Go to Home",
          cta_retry: "Try Again",
          cta_support: "Contact Support",
          helper: "If this keeps happening, include the error code or trace ID when contacting support."
        }
      },
      company: {
        about: {
          title: "From one desk to a movement",
          body: "Our journey started back in 2020, 5 years later; we are changing the game.",
          more: {
            title: "…and the story continues",
            subtitle: "Every year brings new opportunities, and a growing community of disciplined traders building real results."
          },
          cta: {
            title: "Join the next chapter",
            subtitle: "Learn, trade, and grow with the system built by traders who’ve lived it—responsibly, consistently, and together."
          }
        },
        timeline: {
        "2020": {
          title: "From trader to teacher",
            desc:
              "What began as one trader’s daily routine turns into shared notes and live reviews. Teaching sharpens execution and reveals a bigger mission.",
          },
          "2021": {
            title: "A team forms",
            desc:
              "Developers, analysts, and mentors join. Systems replace improvisation. The foundation for a structured company starts taking shape.",
          },
          "2022": {
            title: "The first blueprint",
            desc:
              "Every process documented, every setup codified. The company’s first curriculum blends technical precision with real-world trading flow.",
          },
          "2023": {
            title: "Proof through results",
            desc:
              "Traders trained under the system show measurable consistency. Data replaces anecdotes, and the brand gains industry credibility.",
          },
          "2024": {
            title: "Building the ecosystem",
            desc:
              "An integrated platform launches—analytics, education, and mentorship under one roof. The focus: scalable growth and transparency.",
          },
          "2025": {
            title: "A movement, not just a firm",
            desc:
              "From a single desk to a global network. A company teaching financial freedom through structure, discipline, and shared conviction.",
          },
        },
        careers: {
          title: "Careers",
          subtitle:
            "Join a product-driven team building world-class trading education.",
          type: {
            fulltime: "Full-time",
            parttime: "Part-time",
            contract: "Contract",
          },
          apply: {
            title: "Apply",
            subtitle: "Submit your application for this role. We respect your time and review every submission carefully.",
            loading: "Loading…",
            role_overview: "Role overview",
            requirements: "Requirements",
            application: "Application",
            closes: "Closes",
            form: {
              name: "Name",
              name_ph: "Your full name",
              email: "Email",
              email_ph: "you@example.com",
              phone: "Phone",
              phone_ph: "+218…",
              cover: "Cover Letter",
              cover_ph: "Tell us why you’re a great fit…",
              cover_hint: "Optional but recommended.",
              cv: "CV (PDF/DOC)",
              cv_hint: "Accepted: PDF, DOC, DOCX"
            },
            submit: "Submit Application",
            submit_loading: "Submitting…",
            privacy: "We store your application securely and only use it to evaluate your candidacy.",
            toast: {
              ok_title: "Application submitted",
              ok_desc: "Thank you! We’ll be in touch soon.",
              error_title: "Submission failed"
            },
            errors: {
              missing_id: "Missing job id",
              not_found: "Job not found",
              load_failed: "Failed to load job",
              required: "Please fill all required fields and attach your CV.",
              submit_failed: "Failed to submit application."
            }
          },
          location: { remote: "Remote" },
        },
      },
    },
  },

    ar: {
    translation: {
      common: {
        view: "عرض",
        explore: "استكشف",
        downloads: "تحميلات",
        read_more: "قراءة المزيد",
        enroll_now: "ابدأ الآن",
        free: "مجاني",
        anonymous: "طالب",
      },
      spin: {
        error: "فشل في الدوران",
        description: "قم بتدوير العجلة لفرصة ربح خصم أو وصول VIP!",
        button: "ابدأ الدوران",
        won: "لقد ربحت خصم {{value}}٪!",
        code: "الرمز:",
        valid: "استخدمه عند إتمام الدفع. صالح لمدة 7 أيام.",
        vip_title: "شهر VIP!",
        vip_message: "تهانينا! لقد ربحت شهراً من وصول VIP. أنشئ حسابًا للمطالبة بالجائزة.",
        title: "ادُر واربح",
        close: "إغلاق"
      },
      learn: {
        resources: {
          title: "موارد التعلّم",
          subtitle: "أدلة احترافية وقوائم فحص وفيديوهات تفصيلية لتسريع تقدّمك.",
          guides: "أدلة خطوة بخطوة",
          guides_desc: "خطط عملية من الأساسيات إلى الاستراتيجيات المتقدمة.",
          videos: "مكتبة الفيديو",
          videos_desc: "دروس موجزة وتعمّقات بأمثلة من السوق الحقيقي.",
          downloads: "ملفات للتحميل",
          downloads_desc: "قوائم فحص، قوالب، وأدوات جاهزة للاستخدام.",
          research: "مذكرات بحثية",
          research_desc: "ملاحظات وأطر عمل منتقاة يستخدمها المدربون لدينا.",
          pitch:
            "احصل على المنهج الذي يستخدمه مدربونا مع سيناريوهات واقعية وأطر قابلة للتطبيق. ابدأ مجانًا، وطوّر لاحقًا.",
          guarantee: "مراجَع من المدربين",
          guarantee_value: "عملي وقابل للتطبيق",
          time_to_complete: "متوسط الإتمام",
          time_value: "2–6 أسابيع",
          image_alt: "طلاب يتعلّمون عبر منهج منظم",
          point1: "تطبيقي لا نظري: أمثلة حقيقية وخطوات واضحة.",
          point2: "وصول لدفعات تعلّم وجلسات أسئلة وأجوبة أسبوعية.",
          point3: "تحديثات مدى الحياة للمواد.",
          point4: "شهادة إتمام لإبراز مهاراتك.",
          syllabus: "الخطة الدراسية (معاينة)",
          module1: "الأساسيات والعقلية",
          module2: "الاستراتيجيات الأساسية وإدارة المخاطر",
          module3: "الأدوات والقوالب والأتمتة",
          module4: "دراسات حالة ومراجعات مباشرة",
          testimonials_title: "محبوب من المتعلمين",
          testimonial1: "المحتوى ذهبي. انتقلت من التخمين إلى خطة واضحة.",
          testimonial2: "واضح وموجز وعملي. القوالب وفّرت عليّ أسابيع.",
          testimonial3: "أخيرًا فهمت سبب القرارات وليس فقط كيفيتها.",
          role1: "رائد أعمال",
          role2: "محلل",
          role3: "طالب",
          cta_banner:
            "جاهز للتعمّق؟ انضم إلى الكورسات الكاملة وافتح جميع الموارد.",
        },
        faq: {
          title: "الأسئلة الشائعة",
          subtitle: "كل ما تحتاج معرفته قبل الالتحاق.",
          q1: "ما مدة الوصول إلى المحتوى؟",
          a1: "وصول مدى الحياة للمحتوى والتحديثات المستقبلية.",
          q2: "هل أحصل على شهادة؟",
          a2: "نعم، شهادة قابلة للتنزيل بعد إتمام الكورس.",
          q3: "هل يتوفر دعم؟",
          a3: "دعم على مدار الساعة عبر الدردشة والبريد الإلكتروني.",
        },
      },
       errors: {
        404: {
          title: "الصفحة غير موجودة",
          subtitle: "الصفحة التي تبحث عنها غير متاحة، أو حدث خلل مؤقت في الخادم.",
          code: "رمز الخطأ",
          trace: "معرّف التتبّع",
          cta_home: "العودة للصفحة الرئيسية",
          cta_retry: "إعادة المحاولة",
          cta_support: "الاتصال بالدعم",
          helper: "إذا استمرت المشكلة، يرجى تضمين رمز الخطأ أو معرّف التتبّع عند التواصل مع الدعم."
        }
      },
      legal: {
        refund: {
          title: "سياسة الاسترداد",
          p1: "إذا لم تكن راضيًا خلال 7 أيام من الشراء، تواصل مع الدعم لاسترداد كامل (تسري الشروط).",
          p2: "لا يشمل الاسترداد إساءة استخدام المحتوى أو مشاركته أو مخالفة السياسات.",
          p3: "لبدء الاسترداد، أرسل رسالة إلى الدعم مع رقم الطلب والسبب.",
          eligibility: "الأهلية: الشراء الأول لمنتج/مستوى معيّن مع استخدام معقول ضمن حدود الاستخدام العادل.",
          exclusions: "الاستثناءات: نسخ/مشاركة المحتوى، تنزيل نسبة كبيرة من المواد، مشاركة الحساب، أو إساءة السياسات.",
          digital: "نظرًا لأن الوصول رقمي، قد يكون الاسترداد جزئيًا أو مرفوضًا إذا تم استهلاك جزء كبير من المحتوى.",
          method: "يتم الاسترداد بـ USDT إلى نفس الشبكة المستخدمة للدفع. رسوم الشبكة غير قابلة للاسترداد.",
          timeline: "مدة المعالجة: حتى 10 أيام عمل بعد الموافقة، باستثناء تأخيرات الشبكة.",
          process: "لبدء الاسترداد، أرسل بريدًا إلى الدعم يتضمن رقم الطلب، عنوان المحفظة، والسبب."
        },
        terms: {
          title: "الشروط والأحكام",
          last_updated: "18 ديسمبر 2025",
          intro:
            "باستخدامك لهذه المنصّة أو التحاقك بدوراتنا أو شرائك لمحتوى رقمي، فإنك توافق على هذه الشروط والأحكام. يُرجى قراءتها بعناية قبل المتابعة.",
          scope: {
            title: "النطاق",
            p1: "تحكم هذه الشروط استخدامك لخدماتنا التعليمية والدورات والاشتراكات والوصول إلى المجتمع، والمركّزة على تعليم تداول الفوركس والعملات المشفّرة.",
            p2: "جميع المحتويات المقدَّمة لأغراض تعليمية فقط ولا تُعد نصيحة مالية أو استثمارية."
          },
          use: {
            title: "استخدام المحتوى وحقوق الملكية الفكرية",
            p1: "يُمنح لك ترخيص شخصي غير قابل للتحويل ومحدود للوصول إلى موادنا التعليمية واستخدامها. لا يجوز لك مشاركة أو إعادة بيع أو توزيع أو عرض محتوياتنا علنًا دون إذن كتابي.",
            p2: "جميع مقاطع الفيديو والملفات والقوالب مواد محمية بحقوق الملكية. قد يؤدي الاستخدام غير المصرّح به إلى إيقاف الحساب واتخاذ إجراءات قانونية."
          },
          conduct: {
            title: "سلوك المستخدم",
            p1: "تتعهد بعدم إساءة استخدام المنصّة أو القيام بأي نشاط احتيالي أو مشاركة حسابك أو محاولة الوصول غير المصرّح به إلى أنظمتنا.",
            p2: "نحتفظ بحق تعليق أو إنهاء الحسابات المتورّطة في قرصنة المحتوى أو السلوك المسيء أو أي نشاط يهدد سلامة المنصّة."
          },
          payments: {
            title: "المدفوعات وسياسة الاسترداد",
            p1: "تُعالَج جميع المدفوعات حصريًا بـ USDT. يُرجى مراجعة سياسة الاسترداد لدينا لمعرفة شروط الأهلية وأوقات المعالجة.",
            p2: "أنت مسؤول عن التحقق من عناوين الدفع واختيار الشبكة قبل إرسال معاملات العملات المشفّرة."
          },
          disclaimer: {
            title: "إفصاح المخاطر والغرض التعليمي",
            p1: "ينطوي تداول الفوركس والعملات المشفّرة والأسواق المالية على مخاطر كبيرة. الأداء السابق لا يضمن النتائج المستقبلية.",
            p2: "دوراتنا وقوالبنا وأمثلتنا تعليمية بحتة ولا تُعد نصيحة مالية أو توصية تداول أو توجيهًا استثماريًا.",
            p3: "تقرّ بأنك المسؤول الوحيد عن أي قرارات تداول تتخذها استنادًا إلى المعلومات الواردة في موادنا."
          },
          liability: {
            title: "حدود المسؤولية",
            p1: "لسنا مسؤولين عن أي خسائر أو أضرار أو مطالبات تنشأ عن استخدامك لمنصّتنا أو تطبيق محتوياتنا التعليمية.",
            p2: "يُقدَّم جميع المعلومات 'كما هي' دون أي ضمانات بالدقة أو الاكتمال أو الملاءمة لغرض معيّن."
          },
          modifications: {
            title: "تغييرات على الشروط",
            p1: "قد نقوم بتحديث هذه الشروط دوريًا لتعكس ميزات جديدة أو متطلبات قانونية أو ممارسات عمل. يُعد استمرارك في الاستخدام بعد التحديثات موافقةً عليها."
          }
        },
        payments: {
          usdt_only: "نقبل USDT فقط حاليًا لأننا نرغب بتقديم أسرع وأكثر وسائل التشفير موثوقية للدفع ولإشراك طلابنا مبكرًا في عالم العملات المشفّرة. نرجو تحمّلكم ريثما نوسّع خيارات الدفع.",
          nb: "ملاحظة: نقبل شبكة TRC20 فقط لتقليل الرسوم على طلابنا، ونطلب تزويدنا بتجزئة المعاملة (tx hash) بعد إتمام الدفع للتحقق من كل عملية. شكرًا لتعاونكم."
        },
        privacy_refund: {
          title: "سياسة الخصوصية والاسترداد",
          last_updated: "18 ديسمبر 2025",
          intro: "توضح هذه السياسة كيفية تعاملنا مع بياناتك وكيف تعمل عمليات الاسترداد لمنتجاتنا التعليمية والاشتراكات الخاصة بتعليم الفوركس والعملات المشفّرة.",
          scope: {
            title: "النطاق",
            p1: "تنطبق هذه الشروط على جميع الدورات والجلسات المباشرة والقوالب والمستويات المتاحة على منصّتنا.",
            p2: "الأسواق المالية تنطوي على مخاطر. نحن نقدّم تعليمًا فقط — لا نصائح استثمارية أو إشارات أو إدارة محافظ."
          },
          payments: {
            title: "المدفوعات والتسعير (USDT فقط)",
            p1: "تُجرى جميع المبيعات حصريًا بـ USDT. حيثما أمكن، نقبل USDT على شبكة TRC20 فقط.",
            li1: "قد تُعرض الأسعار بعملتك المحلية للراحة، لكن التسوية النهائية تتم بـ USDT.",
            li2: "رسوم الشبكة وأوقات تأكيد المعاملات خارجة عن سيطرتنا.",
            li3: "أنت مسؤول عن إرسال المبلغ الصحيح إلى العنوان الصحيح على السلسلة الصحيحة. الأموال المرسلة بشكل خاطئ قد لا يمكن استرجاعها.",
            note: "ملاحظة",
            note_text: "يتم تأكيد الدفع بعد عدد كافٍ من التأكيدات على الشبكة."
          },
          access: {
            title: "الوصول، التجديد والإلغاء",
            li1: "الوصول إلى المحتوى الرقمي شخصي وغير قابل للتحويل.",
            li2: "تتجدّد الاشتراكات تلقائيًا ما لم تُلغ قبل تاريخ الفوترة التالي.",
            li3: "الإلغاء يوقف الرسوم المستقبلية ولا يوفّر استردادًا للفترات السابقة."
          },
          chargebacks: {
            title: "الاعتراضات والنزاعات",
            p1: "يرجى التواصل معنا أولًا لحل مشكلات الفوترة أو الوصول. قد يؤدي النزاع غير المصرّح به إلى تعليق الحساب."
          }
        },
        privacy: {
          data: {
            title: "الخصوصية: البيانات التي نجمعها",
            account: "بيانات الحساب: الاسم، البريد الإلكتروني، ومعرّفات الدخول.",
            billing: "بيانات الفوترة: معرفات المعاملات، عنوان المحفظة، وتفاصيل الخطة (لا نجمع المفاتيح الخاصة مطلقًا).",
            usage: "تحليلات الاستخدام: الصفحات التي تمت زيارتها، التقدّم، معلومات الجهاز، والموقع التقريبي (لمنع الاحتيال وتحسين المنتج)."
          },
          use: {
            title: "كيفية استخدام بياناتك",
            provide: "لتقديم وتحسين المحتوى التعليمي، تتبّع التقدّم، وتوفير الدعم.",
            security: "لحماية النظام من الاحتيال أو إساءة الاستخدام أو المشاركة غير المصرّح بها.",
            comms: "لإرسال رسائل الخدمة الأساسية. يمكنك إلغاء الاشتراك من الرسائل التسويقية غير الضرورية."
          },
          cookies: {
            title: "ملفات تعريف الارتباط والتحليلات والخدمات الخارجية",
            p1: "نستخدم ملفات تعريف الارتباط وتقنيات مشابهة للمصادقة والتفضيلات والتحليلات. قد تعالج بعض الجهات الخارجية بيانات شخصية محدودة وفقًا لسياساتها."
          },
          security: {
            title: "الاحتفاظ بالبيانات والأمان",
            retention: "نحتفظ بالبيانات فقط طالما كانت ضرورية للأغراض الموضحة أو كما يقتضيه القانون.",
            measures: "نطبّق تدابير تقنية وتنظيمية، لكن لا توجد وسيلة آمنة بنسبة 100٪."
          },
          rights: {
            title: "حقوقك",
            p1: "وفقًا للقوانين المحلية، يمكنك طلب الوصول أو التصحيح أو الحذف أو نقل بياناتك. قد نطلب التحقق قبل التنفيذ."
          }
        },
        common: {
          last_updated: "آخر تحديث",
          download_pdf: "تحميل كملف PDF",
          contact: "تواصل معنا",
          contact_text: "للاستفسارات حول الخصوصية أو طلبات الاسترداد، تواصل معنا عبر ",
          support_email: "support@promrkts.com",
          disclaimer: "لا يُعد أي مما ورد هنا نصيحة مالية. التداول ينطوي على مخاطر كبيرة بالخسارة. يُقدَّم المحتوى التعليمي كما هو ودون أي ضمانات."
        }
      },
      company: {
        timeline: {
        "2020": {
            title: "من متداول إلى معلّم",
            desc:
              "ما بدأ كروتين يومي لمتداول واحد تحوّل إلى ملاحظات مشتركة ومراجعات مباشرة. التعليم صقل الأداء وكشف عن رسالة أوسع.",
          },
          "2021": {
            title: "تكوّن الفريق",
            desc:
              "انضم مطوّرون ومحلّلون وموجّهون. الأنظمة حلّت محل الارتجال. بدأت ملامح الشركة المنظمة تتكوّن.",
          },
          "2022": {
            title: "المخطط الأول",
            desc:
              "كل عملية موثّقة، وكل نموذج تداول محدد. أول منهج للشركة يجمع بين الدقّة التقنية وسير العمل الواقعي في الأسواق.",
          },
          "2023": {
            title: "الإثبات بالنتائج",
            desc:
              "المتداولون الذين تدرّبوا ضمن النظام حقّقوا ثباتًا ملحوظًا. البيانات حلّت محل القصص، واكتسبت العلامة ثقة في المجال.",
          },
          "2024": {
            title: "بناء المنظومة",
            desc:
              "إطلاق منصة متكاملة تجمع التحليل والتعليم والإرشاد في مكان واحد. الهدف: نمو قابل للتوسع وشفافية كاملة.",
          },
          "2025": {
            title: "حركة وليست مجرد شركة",
            desc:
              "من مكتب واحد إلى شبكة عالمية. شركة تزرع الحرية المالية عبر الانضباط، والنظام، والإيمان المشترك.",
          },
        },
        careers: {
          apply: {
            title: "قدّم طلبك",
            subtitle: "قدّم طلب التوظيف لهذا المنصب. نحن نُقدّر وقتك ونراجع جميع الطلبات بعناية.",
            loading: "جاري التحميل…",
            role_overview: "نظرة عامة على الوظيفة",
            requirements: "المتطلبات",
            application: "طلب التوظيف",
            closes: "يغلق في",
            form: {
              name: "الاسم",
              name_ph: "اكتب اسمك الكامل",
              email: "البريد الإلكتروني",
              email_ph: "you@example.com",
              phone: "رقم الهاتف",
              phone_ph: "+218…",
              cover: "خطاب التقديم",
              cover_ph: "حدثنا عن سبب كونك المرشح المناسب…",
              cover_hint: "اختياري ولكن يُنصح بكتابته.",
              cv: "السيرة الذاتية (PDF/DOC)",
              cv_hint: "الملفات المقبولة: PDF, DOC, DOCX"
            },
            submit: "إرسال الطلب",
            submit_loading: "جاري الإرسال…",
            privacy: "نحفظ بيانات طلبك بأمان ولا نستخدمها إلا لغرض تقييم ترشحك.",
            toast: {
              ok_title: "تم إرسال الطلب",
              ok_desc: "شكرًا لك! سنتواصل معك قريبًا.",
              error_title: "فشل في إرسال الطلب"
            },
            errors: {
              missing_id: "معرّف الوظيفة مفقود",
              not_found: "الوظيفة غير موجودة",
              load_failed: "فشل تحميل تفاصيل الوظيفة",
              required: "يرجى ملء جميع الحقول المطلوبة وإرفاق سيرتك الذاتية.",
              submit_failed: "فشل إرسال الطلب."
            }
          }
        },
        about: {
          title: "من مكتب واحد إلى حركة كاملة",
          body: "بدأت رحلتنا في عام 2020، وبعد خمس سنوات أصبحنا نغيّر قواعد اللعبة.",
          more: {
            title: "…والقصة ما زالت مستمرة",
            subtitle: "كل عام يجلب فرصًا جديدة، ومجتمعًا متناميًا من المتداولين المنضبطين الذين يحققون نتائج حقيقية."
          },
          cta: {
            title: "انضم إلى الفصل التالي",
            subtitle: "تعلّم وتداول وتطوّر من خلال نظام بُني على الخبرة والانضباط—بمسؤولية وثبات وبتعاون حقيقي."
          }
        },
      },
    },
  },

    fr: {
    translation: {
      common: {
        view: "Voir",
        explore: "Explorer",
        downloads: "Téléchargements",
        read_more: "En savoir plus",
        enroll_now: "S’inscrire",
        free: "Gratuit",
        anonymous: "Étudiant",
      },
      errors: {
        404: {
          title: "Page introuvable",
          subtitle: "La page que vous cherchez n’est pas disponible, ou nos serveurs ont eu un léger incident.",
          code: "Erreur",
          trace: "ID de trace",
          cta_home: "Aller à l’accueil",
          cta_retry: "Réessayer",
          cta_support: "Contacter le support",
          helper: "Si cela persiste, indiquez le code d’erreur ou l’ID de trace lors de votre contact avec le support."
        }
      },
      company: {
        careers: {
          apply: "Postuler",
        },
        about: {
          title: "D’un simple bureau à un mouvement",
          body: "Notre aventure a commencé en 2020, cinq ans plus tard, nous changeons la donne.",
          more: {
            title: "…et l’histoire continue",
            subtitle: "Chaque année apporte de nouvelles opportunités et une communauté grandissante de traders disciplinés qui obtiennent de vrais résultats."
          },
          cta: {
            title: "Rejoignez le prochain chapitre",
            subtitle: "Apprenez, tradez et progressez avec un système conçu par des traders expérimentés—de manière responsable, cohérente et collective."
          }
        },
        timeline: {
          "2020": {
            title: "Du trader au mentor",
            desc:
              "Ce qui n’était qu’une routine solitaire devient des notes partagées et des revues en direct. Enseigner affine la pratique et révèle une mission plus vaste.",
          },
          "2021": {
            title: "Une équipe prend forme",
            desc:
              "Développeurs, analystes et formateurs rejoignent l’aventure. Les systèmes remplacent l’improvisation. L’entreprise prend ses fondations.",
          },
          "2022": {
            title: "Le premier plan directeur",
            desc:
              "Chaque processus est documenté, chaque stratégie structurée. Le premier programme unit rigueur technique et réalisme du terrain.",
          },
          "2023": {
            title: "La preuve par les résultats",
            desc:
              "Les traders formés au sein du système démontrent une constance mesurable. Les données remplacent les récits, et la marque gagne en crédibilité.",
          },
          "2024": {
            title: "Construire l’écosystème",
            desc:
              "Lancement d’une plateforme intégrée : analyse, formation et mentorat réunis. Objectif : croissance durable et transparence totale.",
          },
          "2025": {
            title: "Un mouvement avant tout",
            desc:
              "D’un bureau isolé à un réseau mondial. Une entreprise qui enseigne la liberté financière par la méthode, la discipline et la vision partagée.",
          },
        },
        spin: {
          error: "Échec du lancement de la roue",
          description: "Faites tourner la roue pour gagner une réduction ou un accès VIP !",
          button: "Tourner maintenant",
          won: "Vous avez gagné {{value}} % de réduction !",
          code: "Code :",
          valid: "À utiliser au paiement. Valable 7 jours.",
          vip_title: "Mois VIP !",
          vip_message: "Félicitations ! Vous avez gagné 1 mois d’accès VIP. Créez un compte pour en profiter.",
          title: "Tourner & Gagner",
          close: "Fermer"
        },
        apply: {
          title: "Postuler",
          subtitle: "Soumettez votre candidature pour ce poste. Nous respectons votre temps et examinons attentivement chaque demande.",
          loading: "Chargement…",
          role_overview: "Aperçu du poste",
          requirements: "Exigences",
          application: "Candidature",
          closes: "Clôture",
          form: {
            name: "Nom",
            name_ph: "Votre nom complet",
            email: "E-mail",
            email_ph: "vous@example.com",
            phone: "Téléphone",
            phone_ph: "+33…",
            cover: "Lettre de motivation",
            cover_ph: "Expliquez pourquoi vous êtes un bon candidat…",
            cover_hint: "Facultatif mais recommandé.",
            cv: "CV (PDF/DOC)",
            cv_hint: "Formats acceptés : PDF, DOC, DOCX"
          },
          submit: "Soumettre la candidature",
          submit_loading: "Envoi en cours…",
          privacy: "Nous stockons votre candidature en toute sécurité et ne l'utilisons que pour évaluer votre profil.",
          toast: {
            ok_title: "Candidature soumise",
            ok_desc: "Merci ! Nous vous contacterons bientôt.",
            error_title: "Échec de l’envoi"
          },
          errors: {
            missing_id: "Identifiant du poste manquant",
            not_found: "Poste introuvable",
            load_failed: "Impossible de charger le poste",
            required: "Veuillez remplir tous les champs obligatoires et joindre votre CV.",
            submit_failed: "Échec de la soumission de la candidature."
          }
        },
      },
      learn: {
        resources: {
          title: "Ressources d’apprentissage",
          subtitle:
            "Guides premium, listes de vérification et vidéos détaillées pour accélérer vos progrès.",
          guides: "Guides pas à pas",
          guides_desc:
            "Playbooks structurés, des bases aux stratégies avancées.",
          videos: "Bibliothèque vidéo",
          videos_desc:
            "Leçons concises et analyses avec des exemples réels.",
          downloads: "Téléchargements",
          downloads_desc: "Checklists, modèles et outils prêts à l’emploi.",
          research: "Notes de recherche",
          research_desc: "Notes et cadres utilisés par nos mentors.",
          pitch:
            "Accédez au même cursus que nos mentors avec des cas réels et des cadres actionnables. Commencez gratuitement, améliorez quand vous voulez.",
          guarantee: "Validé par les mentors",
          guarantee_value: "Concret & actionnable",
          time_to_complete: "Durée moyenne",
          time_value: "2–6 semaines",
          image_alt: "Des étudiants apprennent avec un contenu structuré",
          point1:
            "Pratique, pas théorique : exemples réels et étapes guidées.",
          point2: "Accès cohorte & sessions Q/R hebdomadaires.",
          point3: "Mises à jour à vie des supports.",
          point4: "Certificat de réussite pour valoriser vos compétences.",
          syllabus: "Programme du cours (aperçu)",
          module1: "Fondamentaux & état d’esprit",
          module2: "Stratégies clés & risque",
          module3: "Outils, modèles & automatisation",
          module4: "Études de cas & revues en direct",
          testimonials_title: "Plébiscité par les apprenants",
          testimonial1:
            "Du contenu en or. Je suis passé de l’intuition à un plan clair.",
          testimonial2:
            "Clair, concis et pratique. Les modèles m’ont fait gagner des semaines.",
          testimonial3:
            "Je comprends enfin le pourquoi derrière les décisions.",
          role1: "Entrepreneur",
          role2: "Analyste",
          role3: "Étudiant",
          cta_banner:
            "Prêt à aller plus loin ? Rejoignez le cours complet et débloquez toutes les ressources.",
        },
        faq: {
          title: "Foire aux questions",
          subtitle: "Tout ce qu’il faut savoir avant de vous inscrire.",
          q1: "Combien de temps dure l’accès ?",
          a1: "Accès à vie au contenu et à ses futures mises à jour.",
          q2: "Est-ce que je reçois un certificat ?",
          a2: "Oui, un certificat téléchargeable après la réussite du cours.",
          q3: "Un support est-il disponible ?",
          a3: "Support 24/7 via chat et e-mail prioritaire.",
        },
      },
      legal: {
        refund: {
          title: "Politique de remboursement",
          p1: "Si vous n’êtes pas satisfait dans les 7 jours suivant l’achat, contactez le support pour un remboursement total (conditions applicables).",
          p2: "Les remboursements excluent l’usage abusif du contenu, le partage ou la violation des politiques.",
          p3: "Pour initier un remboursement, envoyez un e-mail au support avec votre numéro de commande et la raison.",
          eligibility: "Éligibilité : premier achat d’un produit/niveau donné, avec une utilisation raisonnable dans les limites du fair use.",
          exclusions: "Exclusions : copie/partage du contenu, téléchargement d’une grande partie des supports, partage de compte ou abus de politique.",
          digital: "Étant donné que l’accès est numérique, les remboursements peuvent être partiels ou refusés si une grande partie du contenu a été consommée.",
          method: "Les remboursements sont effectués en USDT sur le même réseau utilisé pour le paiement. Les frais de réseau ne sont pas remboursables.",
          timeline: "Délai de traitement : jusqu’à 10 jours ouvrables après approbation, hors délais de réseau.",
          process: "Pour demander un remboursement, envoyez un e-mail au support avec votre identifiant de commande, votre adresse de portefeuille et le motif."
        },
        terms: {
          title: "Conditions générales",
          last_updated: "18 decembre 2025",
          intro:
            "En utilisant cette plateforme, en vous inscrivant à nos cours ou en achetant du contenu numérique, vous acceptez ces conditions générales. Veuillez les lire attentivement avant de continuer.",
          scope: {
            title: "Portée",
            p1: "Ces conditions régissent votre utilisation de nos services éducatifs, cours, abonnements et accès à la communauté, axés sur l’éducation au trading forex et crypto.",
            p2: "Tout le contenu fourni est à des fins éducatives et ne constitue pas un conseil financier ou d’investissement."
          },
          use: {
            title: "Utilisation du contenu & propriété intellectuelle",
            p1: "Vous bénéficiez d’une licence personnelle, non transférable et limitée pour accéder à nos supports éducatifs et les utiliser. Il est interdit de partager, revendre, distribuer ou diffuser publiquement notre contenu sans autorisation écrite.",
            p2: "Toutes les vidéos, PDF et modèles des cours sont protégés par le droit d’auteur. Une utilisation non autorisée peut entraîner la résiliation du compte et des poursuites."
          },
          conduct: {
            title: "Comportement de l’utilisateur",
            p1: "Vous vous engagez à ne pas abuser de la plateforme, à ne pas frauder, à ne pas partager votre compte et à ne pas tenter d’accéder sans autorisation à nos systèmes.",
            p2: "Nous nous réservons le droit de suspendre ou de résilier les comptes impliqués dans le piratage de contenu, un comportement abusif ou toute activité compromettant l’intégrité de la plateforme."
          },
          payments: {
            title: "Paiements & remboursements",
            p1: "Tous les paiements sont traités exclusivement en USDT. Veuillez consulter notre Politique de remboursement pour les conditions d’éligibilité et les délais de traitement.",
            p2: "Vous êtes responsable de vérifier les adresses de paiement et le réseau sélectionné avant d’envoyer des transactions crypto."
          },
          disclaimer: {
            title: "Avertissement sur les risques & finalité éducative",
            p1: "Le trading du forex, des cryptomonnaies et des marchés financiers comporte des risques importants. Les performances passées ne préjugent pas des résultats futurs.",
            p2: "Nos cours, modèles et exemples sont purement éducatifs et ne constituent pas un conseil financier, une recommandation de trading ou une orientation d’investissement.",
            p3: "Vous reconnaissez être seul responsable de toute décision de trading prise sur la base de nos supports."
          },
          liability: {
            title: "Limitation de responsabilité",
            p1: "Nous déclinons toute responsabilité pour les pertes, dommages ou réclamations résultant de votre utilisation de la plateforme ou de l’application de nos contenus éducatifs.",
            p2: "Toutes les informations sont fournies « en l’état » sans garantie d’exactitude, d’exhaustivité ou d’adéquation à un usage particulier."
          },
          modifications: {
            title: "Modifications des conditions",
            p1: "Nous pouvons mettre à jour ces conditions périodiquement pour refléter de nouvelles fonctionnalités, la législation ou nos pratiques. La poursuite de l’utilisation après mise à jour vaut acceptation."
          }
        },
        payments: {
          usdt_only: "Nous n’acceptons que l’USDT pour l’instant afin de proposer la crypto la plus rapide et la plus fiable pour les paiements et d’impliquer nos étudiants tôt dans l’écosystème crypto. Merci de votre patience pendant que nous élargissons nos moyens de paiement.",
          nb: "NB : Nous n’acceptons que TRC20 afin de minimiser les frais pour nos étudiants et nous exigeons un hash de transaction (tx hash) à la fin du paiement pour vérifier chaque transaction. Merci de votre coopération."
        },
        privacy_refund: {
          title: "Politique de confidentialité et de remboursement",
          last_updated: "18 decembre 2025",
          intro: "Cette politique explique comment nous gérons vos données et comment fonctionnent les remboursements pour nos produits éducatifs et abonnements liés au trading forex et crypto.",
          scope: {
            title: "Portée",
            p1: "Ces conditions s’appliquent à tous les cours, sessions en direct, modèles et niveaux d’adhésion disponibles sur notre plateforme.",
            p2: "Les marchés financiers sont risqués. Nous fournissons uniquement de la formation — pas de conseil en investissement, ni de signaux, ni de gestion de portefeuille."
          },
          payments: {
            title: "Paiements et tarifs (USDT uniquement)",
            p1: "Toutes les ventes sont traitées exclusivement en USDT. Lorsque c’est possible, nous acceptons l’USDT uniquement sur le réseau TRC20.",
            li1: "Les prix peuvent être affichés dans votre devise locale à titre indicatif, mais le règlement se fait en USDT.",
            li2: "Les frais de réseau et les délais de confirmation ne dépendent pas de nous.",
            li3: "Vous êtes responsable de l’envoi du montant exact à la bonne adresse sur la bonne chaîne. Des fonds mal envoyés peuvent être irrécupérables.",
            note: "Remarque",
            note_text: "Les paiements sont confirmés après un nombre suffisant de validations on-chain."
          },
          access: {
            title: "Accès, renouvellements et annulations",
            li1: "L’accès au contenu numérique est personnel et non transférable.",
            li2: "Les abonnements se renouvellent automatiquement sauf annulation avant la prochaine date de facturation.",
            li3: "L’annulation arrête les paiements futurs ; elle ne rembourse pas rétroactivement les périodes antérieures."
          },
          chargebacks: {
            title: "Rétrofacturations et litiges",
            p1: "Veuillez nous contacter d’abord pour résoudre les problèmes de facturation ou d’accès. Les litiges non autorisés peuvent entraîner la suspension du compte."
          }
        },
        privacy: {
          data: {
            title: "Confidentialité : données collectées",
            account: "Données de compte : nom, e-mail et identifiants de connexion.",
            billing: "Métadonnées de facturation : ID de transaction, adresse de portefeuille et détails du plan (aucune clé privée collectée).",
            usage: "Analyses d’utilisation : pages vues, progression, informations sur l’appareil et localisation approximative (prévention de la fraude et amélioration du produit)."
          },
          use: {
            title: "Comment nous utilisons vos données",
            provide: "Fournir et améliorer le contenu des cours, suivre la progression et offrir du support.",
            security: "Se protéger contre la fraude, les abus et le partage non autorisé.",
            comms: "Envoyer les e-mails de service essentiels. Vous pouvez vous désinscrire des messages marketing non essentiels."
          },
          cookies: {
            title: "Cookies, analyses et services tiers",
            p1: "Nous utilisons des cookies et technologies similaires pour l’authentification, les préférences et l’analyse. Certains prestataires tiers peuvent traiter des données personnelles limitées selon leurs propres politiques."
          },
          security: {
            title: "Conservation et sécurité des données",
            retention: "Nous conservons les données uniquement aussi longtemps que nécessaire pour les finalités décrites ou tel qu’exigé par la loi.",
            measures: "Nous appliquons des mesures techniques et organisationnelles, mais aucune méthode n’est 100 % sûre."
          },
          rights: {
            title: "Vos droits",
            p1: "Sous réserve des lois applicables, vous pouvez demander l’accès, la rectification, la suppression ou la portabilité de vos données. Une vérification peut être requise."
          }
        },
        common: {
          last_updated: "Dernière mise à jour",
          contact: "Contact",
          download_pdf: "Télécharger en PDF",
          contact_text: "Pour toute question relative à la confidentialité ou aux remboursements, contactez-nous à ",
          support_email: "support@promrkts.com",
          disclaimer: "Rien ici ne constitue un conseil financier. Le trading comporte un risque significatif de perte. Le contenu éducatif est fourni tel quel, sans garantie."
        }
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources, // your existing bundles (can be {}), ns defaults to "translation"
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: { order: ["querystring", "localStorage", "navigator"] },
  })
  .then(() => {
    // 👇 pass the *namespace contents* (the "translation" object), not the wrapper
    i18n.addResourceBundle("en", "translation", NEW_PAGE_STRINGS.en.translation, true, true);
    i18n.addResourceBundle("ar", "translation", NEW_PAGE_STRINGS.ar.translation, true, true);
    i18n.addResourceBundle("fr", "translation", NEW_PAGE_STRINGS.fr.translation, true, true);

    // optional: if your UI rendered before bundles were added, force a refresh
    i18n.reloadResources();
    i18n.emit("loaded"); // helps some setups re-render
  });

export default i18n;


/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { signupFunnel } from "../utils/tracking";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { 
  Box, 
  Container, 
  Text, 
  VStack, 
  HStack, 
  Input, 
  Button, 
  chakra, 
  Heading, 
  SimpleGrid, 
  GridItem, 
  Divider, 
  useColorMode, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton, 
  useDisclosure, 
  Checkbox, 
  FormControl, 
  FormHelperText, 
  Icon, 
  InputGroup, 
  InputRightElement, 
  IconButton 
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import SpotlightCard from "../components/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import PremiumStepIndicator from "../components/PremiumStepIndicator";
import { SocialProofBanner } from "../components/TrustBadges";
import { User, Mail, Phone, FileCheck, ArrowLeft, ArrowRight, Eye, EyeOff, Shield, Zap, CheckCircle, UserPlus } from "lucide-react";
import OAuthButtons from "../components/OAuthButtons";

const CSelect = chakra("select");
const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

type Role = "user";
type Country = { name: string; cca2: string; iddRoots: string[]; iddSuffixes: string[] };

const Fade = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.18 }}
  >
    {children}
  </motion.div>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation() as any;
  const { colorMode } = useColorMode();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const hasTrackedStart = useRef(false);

  // Step state (1: basic, 2: contact, 3: additional)
  const [step, setStep] = useState<number>(1);

  // Common fields
  const [role] = useState<Role>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Extra fields
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [, setLoading] = useState(false);

  // Countries and phone
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // cca2 code
  const [dialCode, setDialCode] = useState<string>("");

  // OTP verification state (phone)
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Email confirmation flow
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(true);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const resendTimerRef = useRef<number | null>(null);

  // Terms & disclaimer
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedDisclaimer, setCheckedDisclaimer] = useState(false);
  const { isOpen: termsOpen, onOpen: openTerms, onClose: closeTerms } = useDisclosure();
  const { isOpen: discOpen, onOpen: openDisc, onClose: closeDisc } = useDisclosure();

  // Track signup started on mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      const source = searchParams.get('ref') || searchParams.get('utm_source') || 'direct';
      signupFunnel.started(source);
    }
  }, [searchParams]);

  // Load countries
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        const data = await resp.json();
        const mapped: Country[] = (data || [])
          .map((c: any) => {
            const root = c?.idd?.root || "";
            const suffixes = Array.isArray(c?.idd?.suffixes) ? c.idd.suffixes : [];
            return {
              name: c?.name?.common || c?.name?.official || "Unknown",
              cca2: c?.cca2 || "",
              iddRoots: root ? [root] : [],
              iddSuffixes: suffixes,
            } as Country;
          })
          .filter((c: Country) => !!c.name);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Update dial code when nationality changes
  useEffect(() => {
    if (!selectedCountry) return;
    const c = countries.find((x) => x.cca2 === selectedCountry);
    if (!c) return;
    const root = c.iddRoots[0] || "";
    const firstSuffix = c.iddSuffixes[0] || "";
    const code = `${root}${firstSuffix}` || "";
    setDialCode(code);
  }, [selectedCountry, countries]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) window.clearInterval(resendTimerRef.current);
    };
  }, []);

  const startResendCooldown = (seconds = 60) => {
    setResendAvailable(false);
    setResendCountdown(seconds);
    resendTimerRef.current = window.setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) {
          if (resendTimerRef.current) window.clearInterval(resendTimerRef.current);
          setResendAvailable(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;
  };

  const sendEmailConfirmation = async (): Promise<boolean> => {
    setError(null);
    if (!email) {
      setError(t("auth.email_required") || "Please enter an email");
      return false;
    }
    try {
      setEmailSending(true);
      if (!accountCreated) {
        // Try to create the account to trigger the initial confirmation email
        try {
          const payload: any = { name, email, password, role };
          const { data } = await api.post("/auth/register", payload);
          const accessToken: string = data?.data?.accessToken || data?.accessToken || data?.token || "";
          if (accessToken) {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("accessToken", accessToken);
          }
          setAccountCreated(true);
          setEmailSent(true);
          startResendCooldown(60);
          return true;
        } catch (regErr: any) {
          const msg = String(regErr?.response?.data?.message || "");
          // If email exists already, just resend the confirmation
          if (msg.toLowerCase().includes("already") && msg.toLowerCase().includes("email")) {
            setAccountCreated(true);
          } else {
            setError(msg || t("auth.email_send_failed") || "Failed to send email");
            return false;
          }
        }
      }
      // Account exists: resend confirmation
      await api.post("/auth/resend-confirmation", { email });
      setEmailSent(true);
      startResendCooldown(60);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.email_send_failed") || "Failed to send email");
      return false;
    } finally {
      setEmailSending(false);
    }
  };

  const resendEmail = async () => {
    if (!resendAvailable) return;
    await sendEmailConfirmation();
  };

  const verifyEmail = async (): Promise<boolean> => {
    setError(null);
    if (emailVerified) {
      return true;
    }

    if (!emailCode) {
      setError(t("auth.email_code_required") || "Enter the 6-digit code.");
      return false;
    }
    try {
      setEmailVerifying(true);
      const normalized = String(emailCode).trim().replace(/\D/g, "");
      if (!normalized) {
        setError(t("auth.email_code_required") || "Enter the 6-digit code.");
        return false;
      }

      await api.post("/auth/confirm", { email, code: normalized });
      setEmailVerified(true);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.email_verify_failed") || "Failed to verify email");
      return false;
    } finally {
      setEmailVerifying(false);
    }
  };

  useEffect(() => {
    if (step === 2 && emailVerified) {
      const id = window.setTimeout(() => setStep(3), 600);
      return () => window.clearTimeout(id);
    }
  }, [step, emailVerified]);

  const sendOtp = async () => {
    setError(null);
    setOtpSent(false);
    setPhoneVerified(false);
    try {
      if (!dialCode || !phone) {
        setError(t("auth.phone_required") || "Please enter your phone number.");
        return;
      }
      setOtpSending(true);
      await api.post("/auth/otp/send", { phone: `${dialCode}${phone}` });
      setOtpSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.otp_send_failed") || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    try {
      if (!otpCode) {
        setError(t("auth.otp_required") || "Enter the OTP code.");
        return;
      }
      setOtpVerifying(true);
      await api.post("/auth/otp/verify", { phone: `${dialCode}${phone}`, code: otpCode });
      setPhoneVerified(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || t("auth.otp_verify_failed") || "Failed to verify OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // DOB validation
      if (dob) {
        const birth = new Date(dob);
        const now = new Date();
        const ageMs = now.getTime() - birth.getTime();
        const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
        if (ageYears < 18) {
          setError(t("auth.error_underage") || "You must be at least 18 years old.");
          setLoading(false);
          return;
        }
        if (ageYears > 100) {
          setError(t("auth.error_overage") || "Please enter a valid date of birth.");
          setLoading(false);
          return;
        }
      }

      // Password validations
      if (password.length < 8) {
        setError(t("auth.password_min") || "Password must be at least 8 characters");
        setLoading(false);
        return;
      }
      if (confirmPassword !== password) {
        setError(t("auth.password_mismatch") || "Passwords do not match");
        setLoading(false);
        return;
      }

      // require phone verification when provided (email can be verified after register)
      if (phone && !phoneVerified) {
        setError(t("auth.phone_verify_required") || "Please verify your phone via OTP.");
        setLoading(false);
        return;
      }

      if (!checkedTerms || !checkedDisclaimer) {
        setError(t("auth.agree_required") || "You must accept the terms and disclaimer.");
        setLoading(false);
        return;
      }

      const fullPhone = phone ? `${dialCode || ""}${phone}` : undefined;
      const payload: any = { name, email, password, role };
      if (selectedCountry) payload.nationality = selectedCountry;
      if (fullPhone) payload.phone = fullPhone;

      if (!accountCreated) {
        const { data } = await api.post("/auth/register", payload);
        const accessToken: string = data?.data?.accessToken || data?.accessToken || data?.token || "";
        if (accessToken) {
          localStorage.setItem("token", accessToken);
          localStorage.setItem("accessToken", accessToken);
        }
        setAccountCreated(true);
      }

      // Ensure both email and phone are verified before finalizing
      if (!emailVerified) {
        setError(t("auth.email_verify_required") || "Please verify your email.");
        setLoading(false);
        return;
      }
      if (phone && !phoneVerified) {
        setError(t("auth.phone_verify_required") || "Please verify your phone via OTP.");
        setLoading(false);
        return;
      }

      // Auto sign-in if no token present
      let token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const accessToken: string = data?.data?.accessToken || data?.accessToken || data?.token || "";
          if (accessToken) {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("accessToken", accessToken);
          }
        } catch (loginErr: any) {
          setError(loginErr?.response?.data?.message || t("auth.login_error") || "Login failed");
          setLoading(false);
          return;
        }
      }

      // Track signup completion
      const userId = localStorage.getItem('user_id') || email;
      signupFunnel.completed(userId);
      
      try { sessionStorage.setItem('auth_splash_once', '1'); } catch {}
      navigate("/products");
    } catch (e: any) {
      const msgRaw = e?.response?.data?.message || "";
      const msg =
        msgRaw.includes("already") && msgRaw.toLowerCase().includes("email")
          ? t("auth.duplicate_email") || "Email already registered"
          : msgRaw || t("auth.register_error") || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for step navigation
  const canAdvanceFromBasic = () => Boolean(
    name.trim() &&
    email.trim() &&
    password.trim() &&
    password.length >= 8 &&
    confirmPassword === password
  );
  const canAdvanceFromContact = () => {
    // Phone is optional - if provided, must be verified; if empty, allow to continue
    if (!phone || phone.trim() === '') return true;
    return Boolean(phoneVerified);
  };

  const isDark = colorMode === 'dark';

  const inputStyles = {
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: isDark ? 'whiteAlpha.200' : 'gray.200',
    bg: isDark ? 'rgba(255,255,255,0.03)' : 'white',
    _hover: { borderColor: isDark ? 'whiteAlpha.300' : 'gray.300' },
    _focus: { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` },
    _placeholder: { color: isDark ? 'whiteAlpha.400' : 'gray.400' },
  };

  return (
    <Box
      minH="100vh"
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 0 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${BRAND}08 0%, transparent 70%)`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-15%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${GOLD}06 0%, transparent 70%)`}
        pointerEvents="none"
      />

      <Container maxW="580px" position="relative" zIndex={1}>
        <VStack align="stretch" spacing={{ base: 5, md: 7 }}>
          {/* Premium Header */}
          <VStack spacing={3} textAlign="center" pt={{ base: 2, md: 6 }}>
            <Box
              w={14}
              h={14}
              borderRadius="2xl"
              bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow={`0 8px 32px ${BRAND}40`}
              mx="auto"
            >
              <Icon as={UserPlus} boxSize={6} color="white" />
            </Box>
            <Heading
              as="h1"
              size="xl"
              bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
              bgClip="text"
              fontWeight="800"
            >
              {t("auth.create_account") || "Join the Trading Elite"}
            </Heading>
            <Text color={isDark ? 'whiteAlpha.600' : 'gray.500'} fontSize="md" maxW="md">
              {t("auth.create_account_sub") || "Start your journey to financial mastery in just 2 minutes"}
            </Text>
            <SocialProofBanner enrolledCount={100007} />
          </VStack>

          {/* OAuth Buttons */}
          <OAuthButtons
            mode="register"
            onError={(msg) => setError(msg)}
          />

          {/* Step Indicator */}
          <PremiumStepIndicator
            steps={[
              { label: t("auth.step_account") || "Account", icon: User },
              { label: t("auth.step_verify") || "Verify", icon: Mail },
              { label: t("auth.step_contact") || "Contact", icon: Phone },
              { label: t("auth.step_complete") || "Complete", icon: FileCheck },
            ]}
            currentStep={step}
          />

          <SpotlightCard>
            {error && (
              <Box
                mb={4}
                p={3}
                bg={isDark ? 'rgba(229, 62, 62, 0.15)' : 'red.50'}
                borderRadius="xl"
                border="1px solid"
                borderColor={isDark ? 'rgba(229, 62, 62, 0.3)' : 'red.200'}
              >
                <Text color={isDark ? 'red.300' : 'red.600'} fontSize="sm" fontWeight="500">{error}</Text>
              </Box>
            )}

            <form onSubmit={onSubmit} ref={formRef}>
              <VStack align="stretch" gap={{ base: 6, md: 8 }} w={{ base: "100%", md: "6xl" }} maxW={{ base: "100%", md: "8xl" }}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <Fade key="step1">
                      {/* ===== Section: Basic info ===== */}
                      <Box textAlign="center">
                        <Heading as="h2" size="sm" mb={3} color="#65a8bf" fontWeight="bold">
                          {t("auth.basic_info") || "Basic information"}
                        </Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                          <GridItem borderRadius="md" px={3} py={2}>
                            <Text fontSize="sm" mb={1.5} fontWeight="600" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                              {t("auth.name")}
                            </Text>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder={(t("auth.name_placeholder") as string) || "John Doe"}
                              required
                              {...inputStyles}
                            />
                          </GridItem>

                          <GridItem borderRadius="md" px={3} py={2}>
                            <Text fontSize="sm" mb={1.5} fontWeight="600" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                              {t("auth.email")}
                            </Text>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder={(t("auth.email_placeholder") as string) || "you@example.com"}
                              required
                              {...inputStyles}
                            />
                          </GridItem>

                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Text fontSize="sm" mb={1.5} fontWeight="600" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                              {t("auth.password")}
                            </Text>
                            <InputGroup>
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={(t("auth.password_placeholder") as string) || "8+ characters"}
                                required
                                {...inputStyles}
                                pr="3rem"
                              />
                              <InputRightElement h="full">
                                <IconButton
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  variant="ghost"
                                  size="sm"
                                  color={isDark ? 'whiteAlpha.500' : 'gray.400'}
                                  _hover={{ color: BRAND }}
                                  onClick={() => setShowPassword((v) => !v)}
                                />
                              </InputRightElement>
                            </InputGroup>
                          </GridItem>

                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Text fontSize="sm" mb={1.5} fontWeight="600" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                              {t("auth.password_confirm") || "Confirm password"}
                            </Text>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder={(t("auth.password_confirm") as string) || "Confirm password"}
                              required
                              {...inputStyles}
                            />
                          </GridItem>
                        </SimpleGrid>

                        <HStack pt={2} justifyContent="space-between" />
                      </Box>
                    </Fade>
                  )}

                  {step === 2 && (
                    <Fade key="step2-email">
                      <Box
                        textAlign="center"
                        p={{ base: 6, md: 8 }}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.200"}
                      >
                        <Box
                          w={16}
                          h={16}
                          mx="auto"
                          mb={4}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box as="span" fontSize="2xl">✉️</Box>
                        </Box>
                        <Heading as="h2" size="md" mb={2} fontWeight="bold">
                          {t("auth.verify_email_title")}
                        </Heading>
                        <Text mb={1} fontSize="sm">
                          {t("auth.verify_email_instructions")}
                        </Text>
                        <Text mb={5} fontSize="sm" fontWeight="medium">
                          {email}
                        </Text>
                        <VStack spacing={4} align="center">
                          <Input
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            placeholder={t("auth.email_code_placeholder") as string}
                            maxW="280px"
                            textAlign="center"
                            fontSize="xl"
                            letterSpacing="0.3em"
                            fontWeight="bold"
                            py={6}
                            borderRadius="lg"
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                          />
                          <HStack spacing={3} justify="center" flexWrap="wrap">
                            <Button
                              onClick={verifyEmail}
                              isLoading={emailVerifying}
                              disabled={!emailCode || emailCode.length < 6}
                              colorScheme="blue"
                              size="lg"
                              px={8}
                            >
                              {t("auth.verify_email")}
                            </Button>
                            <Button
                              onClick={resendEmail}
                              disabled={!resendAvailable}
                              variant="outline"
                              size="lg"
                              colorScheme={resendAvailable ? "gray" : "gray"}
                              opacity={resendAvailable ? 1 : 0.6}
                            >
                              {resendAvailable
                                ? t("auth.resend_email")
                                : `${t("auth.resend_in")} ${Math.ceil(resendCountdown)}s`}
                            </Button>
                          </HStack>
                          {emailVerified && (
                            <HStack spacing={2} color="green.500">
                              <CheckCircleIcon boxSize={6} />
                              <Text fontWeight="medium">{t("auth.email_verified")}</Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    </Fade>
                  )}

                  {step === 3 && (
                    <Fade key="step3">
                      {/* ===== Section: Nationality & Phone (with OTP) ===== */}
                      <Box>
                        <Heading as="h2" size="sm" mb={3}>
                          {t("auth.contact_info") || "Contact information"}
                        </Heading>

                        <SimpleGrid columns={{ base: 2, md: 2 }} spacing={{ base: 4, md: 6 }}>
                          <GridItem borderRadius="md" px={3} py={2} >
                            <Text fontSize="sm" mb={1}>
                              {t("auth.nationality", { defaultValue: "Nationality" })} <Text as="span" color="whiteAlpha.500" fontSize="xs">({t("common.optional", { defaultValue: "optional" })})</Text>
                            </Text>
                            <CSelect
                              value={selectedCountry}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setSelectedCountry(e.target.value)
                              }
                              borderRadius="md"
                              px={3}
                              py={2}
                              maxW="250px"
                              bg={colorMode === "dark" ? "black" : "white"}
                              color={colorMode === "dark" ? "white" : "black"}
                              
                            >
                              <option value="">{t("auth.nationality_placeholder") || "Select a country"}</option>
                              {countries.map((c) => (
                                <option key={c.cca2} value={c.cca2}>
                                  {c.name}
                                </option>
                              ))}
                            </CSelect>
                          </GridItem>

                          <GridItem borderRadius="md" px={3} py={2} >
                            <Text fontSize="sm" mb={1}>
                              {t("auth.phone", { defaultValue: "Phone" })} <Text as="span" color="whiteAlpha.500" fontSize="xs">({t("common.optional", { defaultValue: "optional" })})</Text>
                            </Text>
                            <HStack>
                              <CSelect
                                value={dialCode}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDialCode(e.target.value)}
                                minW={{ base: "40%", md: "36%" }}
                                borderRadius="md"
                                px={3}
                                py={2}
                                
                                bg={colorMode === "dark" ? "black" : "white"}
                                color={colorMode === "dark" ? "white" : "black"}
                              >
                                {(() => {
                                  const c = countries.find((x) => x.cca2 === selectedCountry);
                                  const root = c?.iddRoots?.[0] || "";
                                  const suffixes = c?.iddSuffixes?.length ? c.iddSuffixes : [""];
                                  const opts = suffixes.map((s) => `${root}${s || ""}`).filter(Boolean);
                                  const unique = Array.from(new Set(opts));
                                  return unique.length ? unique : ["+"];
                                })().map((code) => (
                                  <option key={code} value={code}>
                                    {code}
                                  </option>
                                ))}
                              </CSelect>

                              <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={(t("auth.phone_placeholder") as string) || "91 234 5678"}
                                borderRadius="md"
                                px={3}
                                py={2}
                                
                              />
                            </HStack>

                            <HStack mt={2} gap={2} flexWrap="wrap">
                              <Button
                                variant="solid"
                                bg="#65a8bf"
                                onClick={sendOtp}
                                isLoading={otpSending}
                                disabled={!dialCode || !phone}
                              >
                                {t("auth.send_otp") || "Send OTP"}
                              </Button>
                              <Input
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder={(t("auth.otp_placeholder") as string) || "Enter OTP"}
                                maxW="200px"
                                borderRadius="md"
                                
                              />
                              <Button onClick={verifyOtp} isLoading={otpVerifying} bg="#65a8bf" disabled={!otpCode}>
                                {phoneVerified ? t("auth.verified") || "Verified" : t("auth.verify") || "Verify"}
                              </Button>
                            </HStack>

                            {otpSent && !phoneVerified && (
                              <Text fontSize="xs" color="#65a8bf" mt={1}>
                                {t("auth.otp_sent") || "OTP sent. Please check your phone."}
                              </Text>
                            )}
                            {phoneVerified && (
                              <Text fontSize="xs" color="green.500" mt={1}>
                                {t("auth.phone_verified") || "Phone verified."}
                              </Text>
                            )}
                            <Text fontSize="xs" color="#65a8bf" mt={1}>
                              {t("auth.otp_via_whatsapp") || "OTP will be delivered via WhatsApp, not SMS."}
                            </Text>
                            <Text fontSize="xs" color="#65a8bf" mt={1}>
                              {t("auth.whatsapp_required") || "Your phone must be linked to WhatsApp to receive the OTP."}
                            </Text>
                          </GridItem>
                        </SimpleGrid>

                        <HStack pt={2} justifyContent="space-between" />
                      </Box>
                    </Fade>
                  )}

                  {step === 4 && (
                    <Fade key="step4">
                      {/* ===== Section: Additional details (optional) ===== */}
                      <Box>
                        <Heading as="h2" size="sm" mb={3}>
                          {t("auth.additional_info") || "Additional details"}
                        </Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                          <GridItem borderRadius="md" px={3} py={2}>
                            <Text fontSize="sm" mb={1} color="#65a8bf">
                              {t("auth.dob") || "Date of birth"}
                            </Text>
                            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} placeholder={t("auth.dob_placeholder") || "Date of birth"} />
                          </GridItem>
                          <GridItem borderRadius="md" px={3} py={2} >
                            <Text fontSize="sm" mb={1} color="#65a8bf">
                              {t("auth.gender", { defaultValue: "Gender" })} <Text as="span" color="whiteAlpha.500" fontSize="xs">({t("common.optional", { defaultValue: "optional" })})</Text>
                            </Text>
                            <CSelect value={gender} onChange={(e) => setGender(e.target.value)} borderRadius="md" px={3} py={2} bg={colorMode === "dark" ? "black" : "white"} color={colorMode === "dark" ? "white" : "black"} >
                              <option value="">{t("common.select") || "Select"}</option>
                              <option value="male">{t("auth.gender_male") || "Male"}</option>
                              <option value="female">{t("auth.gender_female") || "Female"}</option>
                            </CSelect>
                          </GridItem>
                        </SimpleGrid>

                        <Divider />

                        <FormControl mt={2}>
                          <Checkbox isChecked={checkedTerms} onChange={(e) => setCheckedTerms(e.target.checked)}>
                            {t("auth.accept_terms") || "I accept the Terms & Conditions"}
                          </Checkbox>
                          <FormHelperText>
                            <Button variant="link" onClick={openTerms}>
                              {t("auth.view_terms") || "View terms"}
                            </Button>
                          </FormHelperText>
                        </FormControl>

                        <FormControl mt={2}>
                          <Checkbox isChecked={checkedDisclaimer} onChange={(e) => setCheckedDisclaimer(e.target.checked)}>
                            {t("auth.accept_disclaimer") || "I accept the Disclaimer"}
                          </Checkbox>
                          <FormHelperText>
                            <Button variant="link" onClick={openDisc}>
                              {t("auth.view_disclaimer") || "View disclaimer"}
                            </Button>
                          </FormHelperText>
                        </FormControl>
                        <HStack pt={2} justifyContent="space-between" />
                      </Box>
                    </Fade>
                  )}
                </AnimatePresence>
              </VStack>
            </form>

            {/* Bottom arrow navigation */}
            <HStack mt={6} justifyContent="space-between">
              <Button
                leftIcon={<ArrowLeft size={16} />}
                variant="ghost"
                color={BRAND}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                isDisabled={step === 1}
                borderRadius="xl"
                _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
              >
                {t("checkout.actions.back") || "Back"}
              </Button>
              <Button
                rightIcon={<ArrowRight size={16} />}
                bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                color="white"
                fontWeight="700"
                borderRadius="xl"
                px={8}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${BRAND}40`,
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                onClick={async () => {
                  if (step === 1) {
                    if (!name.trim() || !email.trim()) {
                      setError(t("auth.register_error") || "Please fill all required fields.");
                      return;
                    }
                    if (password.length < 8) {
                      setError(t("auth.password_min") || "Password must be at least 8 characters");
                      return;
                    }
                    if (confirmPassword !== password) {
                      setError(t("auth.password_mismatch") || "Passwords do not match");
                      return;
                    }
                    const ok = await sendEmailConfirmation();
                    if (!ok) return;
                    signupFunnel.step1Completed(email);
                    signupFunnel.emailSent();
                    setError(null);
                    setStep(2);
                  } else if (step === 2) {
                    const ok = await verifyEmail();
                    if (!ok) return;
                    signupFunnel.step2Completed();
                    signupFunnel.emailVerified();
                    setError(null);
                    setStep(3);
                  } else if (step === 3) {
                    if (!canAdvanceFromContact()) {
                      setError(t("auth.phone_verify_required") || "Please verify your WhatsApp/phone OTP to continue.");
                      return;
                    }
                    signupFunnel.step3Completed();
                    setError(null);
                    setStep(4);
                  } else if (step === 4) {
                    // Submit form on final step
                    formRef.current?.requestSubmit();
                  }
                }}
                isDisabled={(step === 1 && !canAdvanceFromBasic()) || (step === 3 && !canAdvanceFromContact())}
              >
                {step === 4 ? (t("auth.create_account") || "Create Account") : (t("common.next") || "Next")}
              </Button>
            </HStack>
          </SpotlightCard>

          {/* Trust indicators */}
          <HStack justify="center" spacing={6} flexWrap="wrap" py={2}>
            <HStack spacing={1.5}>
              <Icon as={Shield} boxSize={3.5} color="green.500" />
              <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                SSL Secured
              </Text>
            </HStack>
            <HStack spacing={1.5}>
              <Icon as={Zap} boxSize={3.5} color={BRAND} />
              <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                2 Min Setup
              </Text>
            </HStack>
            <HStack spacing={1.5}>
              <Icon as={CheckCircle} boxSize={3.5} color={GOLD} />
              <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                Free to Join
              </Text>
            </HStack>
          </HStack>

          <Text textAlign="center" fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>
            {t("auth.already_have") || "Already have an account?"}{' '}
            <Link to="/login">
              <Text as="span" color={GOLD} fontWeight="700">{t("auth.login") || "Sign In"}</Text>
            </Link>
          </Text>
        </VStack>
      </Container>

      {/* Terms modal */}
      <Modal isOpen={termsOpen} onClose={closeTerms} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("auth.terms") || "Terms & Conditions"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={3} fontSize="sm">
              <Text><strong>Agreement.</strong> By creating an account, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Services.</Text>
              <Text><strong>Educational Only.</strong> All content is for educational/informational purposes. We do not provide financial, investment, legal, or tax advice. Markets involve substantial risk of loss. You are solely responsible for your decisions.</Text>
              <Text><strong>No Guarantees.</strong> We make no warranties of profitability, performance, or results. Past performance does not guarantee future results. The Services are provided "as is" and "as available" without warranties of any kind.</Text>
              <Text><strong>Risk Disclosure.</strong> Trading foreign exchange, crypto, or derivatives carries a high level of risk and may not be suitable for all investors. You could lose some or all of your capital. Only risk what you can afford to lose.</Text>
              <Text><strong>License & Acceptable Use.</strong> We grant a limited, revocable, non‑transferable license to access the Services for personal, non‑commercial use. You must not copy, redistribute, reverse engineer, misuse, or interfere with the Services.</Text>
              <Text><strong>Accounts.</strong> You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. We may suspend or terminate access for violations or suspected fraud/abuse.</Text>
              <Text><strong>Payments.</strong> Fees are non‑refundable unless required by law or explicitly stated. We may change pricing with notice. Access may be suspended for unpaid amounts.</Text>
              <Text><strong>Limitation of Liability.</strong> To the maximum extent permitted by law, we and our affiliates, officers, employees, and partners shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, data, or use, arising out of or related to your use of the Services.</Text>
              <Text><strong>Indemnity.</strong> You agree to indemnify and hold us harmless from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from your use of the Services or violation of these Terms or applicable law.</Text>
              <Text><strong>Compliance.</strong> You are solely responsible for complying with local laws and regulations, including any registration, licensing, tax, or reporting obligations.</Text>
              <Text><strong>Governing Law & Dispute Resolution.</strong> These Terms are governed by the laws of your company’s jurisdiction. Disputes shall be resolved exclusively in the courts or via binding arbitration in that venue, unless otherwise required by law.</Text>
              <Text><strong>Changes.</strong> We may modify these Terms at any time. Continued use after changes constitutes acceptance.</Text>
              <Text>For full legal terms or a signed agreement, contact support.</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => { setCheckedTerms(true); closeTerms(); }}>
              {t("common.accept") || "Accept"}
            </Button>
            <Button variant="ghost" onClick={closeTerms}>{t("common.close") || "Close"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Disclaimer modal */}
      <Modal isOpen={discOpen} onClose={closeDisc} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("auth.disclaimer") || "Disclaimer"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={3} fontSize="sm">
              <Text><strong>Educational Purpose.</strong> The content, tools, signals, and communications are provided for educational purposes only and do not constitute financial advice, investment advice, trading advice, legal advice, or tax advice.</Text>
              <Text><strong>No Client Relationship.</strong> Your use of the Services does not create any fiduciary, advisory, or client relationship. Decisions to trade or invest are yours alone.</Text>
              <Text><strong>Market Risk.</strong> Trading and investing involve significant risk, including the possible loss of principal. Leverage and volatility can magnify losses. Do not risk funds you cannot afford to lose.</Text>
              <Text><strong>Accuracy.</strong> While we strive for accuracy, information may be incomplete or incorrect and may change without notice. We do not guarantee timeliness, accuracy, or completeness.</Text>
              <Text><strong>Third Parties.</strong> We are not responsible for third‑party services, brokers, platforms, or communications. Use at your own risk and conduct your own due diligence.</Text>
              <Text><strong>Limitation of Liability.</strong> To the fullest extent permitted by law, we disclaim all liability for any losses or damages arising from reliance on the Services.</Text>
              <Text><strong>Regulatory Compliance.</strong> You are responsible for complying with applicable laws and regulations in your jurisdiction.</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => { setCheckedDisclaimer(true); closeDisc(); }}>
              {t("common.accept") || "Accept"}
            </Button>
            <Button variant="ghost" onClick={closeDisc}>{t("common.close") || "Close"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Register;
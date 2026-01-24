import React from "react";
import { Box, Heading, Text, VStack, HStack, Button, Icon } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ShieldCheck, FilePlus2, Users, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const AdminIndex: React.FC = () => {
  const { t } = useTranslation() as any;
  return (
    <Box py={6} color="text.primary" alignContent="center">
      <Heading size="lg" mb={2} textAlign="center">{t("admin.title") || "Admin Dashboard"}</Heading>
      <Text mb={6} textAlign="center">{t("admin.subtitle") || "Manage verifications and discovery content."}</Text>

      <Box bg="bg.surface">
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="md" mb={2}>{t("admin.quick_actions") || "Quick Actions"}</Heading>
            <HStack gap={3} flexWrap="wrap">
              <RouterLink to="/admin/verifications">
                <Button variant="outline" color="text.primary" borderColor="text.primary">
                  <Icon as={ShieldCheck} mr={2} /> {t("admin.verifications") || "Verifications"}
                </Button>
              </RouterLink>
              <RouterLink to="/admin/content">
                <Button variant="outline" color="text.primary" borderColor="text.primary">
                  <Icon as={FilePlus2} mr={2} /> {t("admin.create_content") || "Create Content"}
                </Button>
              </RouterLink>
            </HStack>
          </Box>

          <Box>
            <Heading size="md" mb={2}>{t("admin.overview") || "Overview"}</Heading>
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <Text>{t("admin.pending_usdt") || "Pending USDT"}</Text>
                <RouterLink to="/admin/verifications">
                  <Button size="sm" variant="ghost" color="text.primary"><Icon as={Users} mr={2} /> {t("admin.view") || "View"}</Button>
                </RouterLink>
              </HStack>
              <HStack justify="space-between">
                <Text>{t("admin.pending_balance") || "Pending Balance"}</Text>
                <RouterLink to="/admin/verifications">
                  <Button size="sm" variant="ghost" color="text.primary"><Icon as={Building2} mr={2} /> {t("admin.view") || "View"}</Button>
                </RouterLink>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminIndex;

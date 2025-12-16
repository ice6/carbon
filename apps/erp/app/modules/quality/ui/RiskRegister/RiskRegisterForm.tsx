import { ValidatedForm } from "@carbon/form";
import {
  Button,
  HStack,
  ModalDrawer,
  ModalDrawerBody,
  ModalDrawerContent,
  ModalDrawerFooter,
  ModalDrawerHeader,
  ModalDrawerProvider,
  ModalDrawerTitle,
  toast,
  useDisclosure,
  VStack
} from "@carbon/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import type { z } from "zod/v3";
import {
  Employee,
  Hidden,
  Input,
  Number as NumberInput,
  Select,
  Submit,
  TextArea
} from "~/components/Form";
import { Confirm } from "~/components/Modals";
import { usePermissions } from "~/hooks";
import {
  riskRegisterValidator,
  riskStatus
} from "~/modules/quality/quality.models";
import { path } from "~/utils/path";

type RiskRegisterFormProps = {
  initialValues: z.infer<typeof riskRegisterValidator>;
  type?: "modal" | "drawer";
  open?: boolean;
  onClose: () => void;
};

const RiskRegisterForm = ({
  initialValues,
  open = true,
  type = "drawer",
  onClose
}: RiskRegisterFormProps) => {
  const permissions = usePermissions();
  const fetcher = useFetcher<PostgrestResponse<{ id: string }>>();
  const deleteDisclosure = useDisclosure();
  const deleteFetcher = useFetcher<{ success: boolean; message: string }>();

  useEffect(() => {
    if (fetcher.data?.data) {
      onClose?.();
      toast.success(`Saved risk`);
    } else if (fetcher.data?.error) {
      toast.error(`Failed to save risk: ${fetcher.data.error.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, onClose]);

  useEffect(() => {
    if (deleteFetcher.data?.success) {
      deleteDisclosure.onClose();
      onClose?.();
      toast.success(deleteFetcher.data.message || "Deleted risk");
    } else if (deleteFetcher.data?.success === false) {
      toast.error(deleteFetcher.data.message || "Failed to delete risk");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deleteFetcher.data?.success,
    deleteDisclosure,
    onClose,
    deleteFetcher.data?.message
  ]);

  const isEditing = !!initialValues.id;
  const isDisabled = isEditing
    ? !permissions.can("update", "quality")
    : !permissions.can("create", "quality");

  // Set default values for severity and likelihood
  const formInitialValues = {
    ...initialValues,
    severity: initialValues.severity ?? 1,
    likelihood: initialValues.likelihood ?? 1
  };

  return (
    <>
      <ModalDrawerProvider type={type}>
        <ModalDrawer
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose?.();
          }}
        >
          <ModalDrawerContent>
            <ValidatedForm
              validator={riskRegisterValidator}
              method="post"
              action={
                isEditing ? path.to.risk(initialValues.id!) : path.to.newRisk
              }
              defaultValues={formInitialValues}
              fetcher={fetcher}
              className="flex flex-col h-full"
            >
              <ModalDrawerHeader>
                <ModalDrawerTitle>
                  {isEditing ? "Edit" : "New"} Risk
                </ModalDrawerTitle>
              </ModalDrawerHeader>
              <ModalDrawerBody>
                <Hidden name="id" />
                <Hidden name="source" />
                {/* Context field for the source entity ID */}
                <Hidden name="sourceId" />

                <VStack spacing={4}>
                  <Input name="title" label="Title" />
                  <TextArea name="description" label="Description" />

                  <Select
                    name="status"
                    label="Status"
                    options={riskStatus.map((s) => ({ value: s, label: s }))}
                  />

                  <HStack spacing={4} className="w-full">
                    <NumberInput
                      name="severity"
                      label="Severity (1-5)"
                      minValue={1}
                      maxValue={5}
                    />
                    <NumberInput
                      name="likelihood"
                      label="Likelihood (1-5)"
                      minValue={1}
                      maxValue={5}
                    />
                  </HStack>

                  <Employee name="assigneeUserId" label="Assignee" />
                </VStack>
              </ModalDrawerBody>
              <ModalDrawerFooter>
                <HStack className="justify-between w-full">
                  <div>
                    {isEditing && permissions.can("delete", "quality") && (
                      <Button
                        size="md"
                        variant="destructive"
                        onClick={() => deleteDisclosure.onOpen()}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <HStack>
                    <Submit isDisabled={isDisabled}>Save</Submit>
                    <Button
                      size="md"
                      variant="solid"
                      onClick={() => onClose?.()}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </HStack>
              </ModalDrawerFooter>
            </ValidatedForm>
          </ModalDrawerContent>
        </ModalDrawer>
      </ModalDrawerProvider>

      {isEditing && initialValues.id && deleteDisclosure.isOpen && (
        <Confirm
          isOpen={deleteDisclosure.isOpen}
          confirmText="Delete"
          onCancel={deleteDisclosure.onClose}
          title="Delete Risk"
          text="Are you sure you want to delete this risk?"
          action={path.to.deleteRisk(initialValues.id)}
        />
      )}
    </>
  );
};

export default RiskRegisterForm;

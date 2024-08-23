"use client";
import React, { FC, useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { Plus } from "lucide-react";
import {TOAST_TYPE, setToast } from "@plane/ui";
// constants
import { MAX_FILE_SIZE } from "@/constants/common";
// helper
import { generateFileName } from "@/helpers/attachment.helper";
// hooks
import { useInstance, useIssueDetail } from "@/hooks/store";

import { useAttachmentOperations } from "./helper";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  customButton?: React.ReactNode;
  disabled?: boolean;
};

export const IssueAttachmentActionButton: FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, issueId, customButton, disabled = false } = props;
  // state
  const [isLoading, setIsLoading] = useState(false);
  // store hooks
  const { config } = useInstance();
  const { setLastWidgetAction } = useIssueDetail();

  // operations
  const handleAttachmentOperations = useAttachmentOperations(workspaceSlug, projectId, issueId);

  // handlers
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
        const currentFile: File = acceptedFiles[0];
        if (!currentFile || !workspaceSlug) return;

        const uploadedFile: File = new File([currentFile], generateFileName(currentFile.name), {
          type: currentFile.type,
        });
        const formData = new FormData();
        formData.append("asset", uploadedFile);
        formData.append(
          "attributes",
          JSON.stringify({
            name: uploadedFile.name,
            size: uploadedFile.size,
          })
        );
        setIsLoading(true);
        handleAttachmentOperations.create(formData)
        .catch(()=>{
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "File could not be attached. Try uploading again.",
          })
        })
        .finally(() => {
          setLastWidgetAction("attachments");
          setIsLoading(false);
      });
    },
    [handleAttachmentOperations, workspaceSlug]
  );
  const handleFileRejection = useCallback(() => {
    setToast({
      type: TOAST_TYPE.ERROR,
      title: "Error!",
      message: "File size too large. Max file size: 5MB.",
    })
  }, []);

  const handleError = useCallback(()=>{
    setToast({
      type: TOAST_TYPE.ERROR,
      title: "Error!",
      message: "Some error occurred. Try uploading the file again.",
    })
  },[]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: config?.file_size_limit ?? MAX_FILE_SIZE,
    multiple: false,
    disabled: isLoading || disabled,
    onDropRejected: handleFileRejection,
    onError: handleError,
  });

  return (
    <button {...getRootProps()} type="button" disabled={disabled}>
      <input {...getInputProps()} />
      {customButton ? customButton : <Plus className="h-4 w-4" />}
    </button>
  );
});
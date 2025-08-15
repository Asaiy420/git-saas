"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const MeetingCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) {
        return "Please add a file first";
      }
      const downloadFile = await uploadFile(file as File, setProgress);
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center border-none p-10 shadow-2xl "
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="size-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with Blaze.
            <br />
            Powerd By AI
          </p>
          <div className="mt-10">
            <Button disabled={isUploading} className="cursor-pointer">
              <Upload className="mr-1.5 -ml-0.5 size-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
          <div>
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              className="size-20"
              styles={
                buildStyles({
                  pathColor: '#2563eb',
                  textColor: '#2563eb',
                })
              }
            />
            <p className="text-center text-sm text-gray-500">
              Uploading your meeting...
            </p>
          </div>
      )}
    </Card>
  );
};

export default MeetingCard;

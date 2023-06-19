"use client";
import {
  Box,
  Heading,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { getChampionSpellImageSrc } from "./ChampionModal";
import { v4 as uuid } from "uuid";
import { useState } from "react";

interface SquareTooltipImageProps {
  imageSrc: string;
  label: string;
  tooltip: {
    title: string;
    content: string;
  };
}

export default function SquareTooltipImage({
  imageSrc,
  label,
  tooltip,
}: SquareTooltipImageProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  return (
    <Skeleton
      mb={4}
      rounded={"md"}
      aspectRatio={"1/1"}
      height={{ base: "12", sm: "16", md: "16" }}
      width={{ base: "12", sm: "16", md: "16" }}
      position={"relative"}
      isLoaded={!isImageLoading}
    >
      <Tooltip
        key={`${label}_${uuid()}`}
        rounded={"base"}
        placement={"top"}
        hasArrow
        label={
          <Box padding={1}>
            <VStack alignItems={"start"} gap={1}>
              <Heading size={"sm"}> {tooltip.title}</Heading>
              <Text
                fontWeight={"normal"}
                dangerouslySetInnerHTML={{
                  __html: tooltip.content,
                }}
              ></Text>
            </VStack>
          </Box>
        }
      >
        <VStack cursor={"pointer"} gap={1}>
          <Box
            rounded={"md"}
            overflow={"auto"}
            aspectRatio={"1/1"}
            height={{ base: "12", sm: "16", md: "16" }}
            width={{ base: "12", sm: "16", md: "16" }}
            position={"relative"}
          >
            <Image
              fill
              sizes="(max-width: 768px) 7vw, (max-width: 1200px) 3vw,3vw"
              alt={label}
              src={imageSrc}
              onLoad={() => setIsImageLoading(false)}
            />
          </Box>
          <Text> {label}</Text>
        </VStack>
      </Tooltip>
    </Skeleton>
  );
}

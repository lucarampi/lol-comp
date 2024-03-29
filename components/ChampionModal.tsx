"use client";
import {
  Box,
  Button,
  Grid,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChampionType,
  getChampionSplashImageSrc,
  getChampionSquareImageSrc,
  getChampionStatsAsKeyValueArray,
} from "./ChampionList";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RiotAPITypes } from "@fightmegg/riot-api";
import api from "@/lib/axios";
import useSWR from "swr";
import SquareTooltipImage from "./SquareTooltipImage";

interface ChampionModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  champion: ChampionType;
}

const fetcher = (url: string) =>
  api.get<RiotAPITypes.DDragon.DDragonChampionDTO>(url).then((res) => res.data);

export default function ChampionModal({
  isOpen,
  onClose,
  onOpen,
  champion,
}: ChampionModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [popoverStates, setPopoverStates] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [championData, setChampionData] =
    useState<RiotAPITypes.DDragon.DDragonChampionDataDTO>();
  const { data, error, isLoading } = useSWR(
    `/api/champion/${champion.id}`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );
  useEffect(() => {
    if (!error && !!data && !!data?.data) {
      const championDataMap = new Map(Object.entries(data?.data));
      setChampionData(championDataMap.get(champion.id));
    }
  }, [data]);

  return (
    <Modal
      motionPreset={"scale"}
      size={"2xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent paddingX={2}>
        <ModalHeader
          isTruncated
          as={"h1"}
          fontSize={"2xl"}
          paddingBottom={1}
          paddingTop={3}
        >
          {champion.name} - {champion.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Skeleton rounded={"lg"} isLoaded={!isImageLoading}>
            <Box
              rounded={"lg"}
              overflow={"auto"}
              aspectRatio={"405/239"}
              position={"relative"}
            >
              <Image
                onLoad={() => setIsImageLoading(false)}
                quality={40}
                onLoadedData={() => alert()}
                alt={champion.name}
                fill
                sizes="(max-width: 768px) 55vw, (max-width: 1200px) 40vw, 40vw"
                src={getChampionSplashImageSrc(champion.id)}
              />
            </Box>
          </Skeleton>
          <VStack marginTop={4} gap={4}>
            <Box width={"full"}>
              <Heading as={"h2"} size={"md"}>
                Habilidades
              </Heading>
              <Grid
                placeItems={"center"}
                marginTop={2}
                templateColumns={"repeat(5, 1fr)"}
              >
                <SquareTooltipImage
                  imageSrc={getChampionPassiveImageSrc(
                    championData?.passive.image.full || "",
                    champion.version
                  )}
                  label={"Passiva"}
                  tooltip={{
                    title: championData?.passive.name || "",
                    content: championData?.passive.description || "",
                  }}
                />
                {championData?.spells.map((spell, index) => (
                  <SquareTooltipImage
                    key={spell.id}
                    imageSrc={getChampionSpellImageSrc(
                      spell.image.full,
                      champion.version
                    )}
                    label={getSpellLetter(index)}
                    tooltip={{
                      title: spell.name,
                      content: spell.description,
                    }}
                  />
                ))}
              </Grid>
            </Box>
            <Box>
              <Heading as={"h2"} size={"md"}>
                Sobre
              </Heading>
              <Text>{championData?.blurb}</Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent={"space-between"}>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Voltar
          </Button>
          <Button cursor={"not-allowed"} disabled>
            Ir para a tela do campeão
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function getChampionSpellImageSrc(spell: string, version: string) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell}`;
}

export function getSpellLetter(index: number) {
  const spellLetter = ["Q", "W", "E", "R"];
  return spellLetter[index] || "";
}

export function getChampionPassiveImageSrc(passive: string, version: string) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passive}`;
}

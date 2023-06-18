"use client"
import { Box, Button, Grid, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Text, Tooltip, VStack, useDisclosure } from "@chakra-ui/react"
import { ChampionType, getChampionSplashImageSrc, getChampionSquareImageSrc, getChampionStatsAsKeyValueArray } from "./ChampionList";
import Image from "next/image";
import { useState } from "react";

interface ChampionModalProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void
    champion: ChampionType;
}

export default function ChampionModal({ isOpen, onClose, onOpen, champion }: ChampionModalProps) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    return (
        <Modal motionPreset={"scale"} size={"2xl"} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent paddingX={2}>
                <ModalHeader as={"h1"} fontSize={"2xl"} paddingBottom={1} paddingTop={3} >{champion.name} - {champion.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Skeleton rounded={"lg"} isLoaded={!isImageLoading}>
                        <Box rounded={"lg"} overflow={"auto"} aspectRatio={"405/239"} position={"relative"}>
                            <Image onLoad={() => setIsImageLoading(false)} sizes="27vw"  onLoadedData={() => alert()} alt={champion.name} fill src={getChampionSplashImageSrc(champion.id)} />
                        </Box>
                    </Skeleton>
                    <VStack marginTop={4} gap={4}>

                        <VStack alignItems={"start"} width={"full"}>
                            <Heading as={"h2"} size={"md"}>Status base</Heading>
                            <Grid paddingX={2} width={"full"}  templateRows={"repeat(2, 1fr)"} templateColumns={"repeat(5, 1fr)"}>
                                {getChampionStatsAsKeyValueArray(champion).filter(stat => stat[0].includes("level") || stat[0].includes("regen") ? false : true).map((value, index, array) => <Box key={value[0]}>
                                    <Tooltip hasArrow label={value[0]} placement={"top"}>
                                        <HStack width={"fit-content"} cursor={"default"} gap={0.5} alignItems={"center"} justifyContent={"start"}>
                                            <Image style={{ filter: "invert(1)" }} alt={value[0]} src={`/stats/${value[0]}.webp`} width={18} height={18} /> <Text>: {value[1]}</Text>
                                        </HStack>
                                    </Tooltip>
                                </Box>)}
                            </Grid>
                        </VStack>
                        <Box>
                            <Heading as={"h2"} size={"md"}>Sobre</Heading>
                            <Text paddingX={2}>
                                {champion.blurb}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter justifyContent={"space-between"}>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Voltar
                    </Button>
                    <Button cursor={"not-allowed"} disabled>Ir para a tela do campeão</Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    )
}
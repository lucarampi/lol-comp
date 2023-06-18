"use client"
import { Image } from "@chakra-ui/next-js";
import { Box, Button, Grid, GridItem, HStack, Text, Tooltip, useDisclosure } from "@chakra-ui/react";
import { ChampionType, ChampionsTypeEnum, getChampionSquareImageSrc, getChampionStatsAsKeyValueArray } from "./ChampionList";
import ChampionModal from "./ChampionModal";

interface ChampionImageProps {
    champion: ChampionType;
}

export default function ChampionImage({ champion }: ChampionImageProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <Tooltip
                rounded={"base"}
                hasArrow
                animation={""}
                label={<Box padding={1}>
                    <Text textAlign={"center"}>
                        {champion?.tags
                            .map(
                                (tag) =>
                                    ChampionsTypeEnum[tag as keyof typeof ChampionsTypeEnum]
                            )
                            .join(" | ")}
                    </Text>
                    <Grid padding={1} templateColumns='repeat(2, 1fr)' fontWeight={"normal"} columnGap={4}>
                        {getChampionStatsAsKeyValueArray(champion).filter(stat => stat[0].includes("level") || stat[0].includes("regen") ? false : true).map((value, index, array) => <GridItem colSpan={array.length - 1 == index ? 2 : 1} key={value[0]}>
                            <HStack gap={0.5} alignItems={"center"} justifyContent={array.length - 1 == index ? "center" : "start"}>
                                <Image alt={value[0]} src={`/stats/${value[0]}.webp`} width={3.5} height={3.5} /> <Text>: {value[1]}</Text>
                            </HStack>
                        </GridItem>)}

                    </Grid>
                </Box>}
                key={champion?.name}
            >
                <Box
                    onClick={onOpen}
                    cursor={"pointer"}
                    position={"relative"}
                    width={[14, 16, 20]}
                    height={[14, 16, 20]}
                >
                    <Image
                        quality={50}
                        fill
                        src={getChampionSquareImageSrc(champion.version, champion.image.full)}
                        alt={champion?.name}
                    />
                </Box>
            </Tooltip>
            <ChampionModal champion={champion} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
        </>

    );
}
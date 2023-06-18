"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  TagRightIcon,
  Text,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/next-js";
import { RiotAPITypes } from "@fightmegg/riot-api";
import { filter, isEqual, sampleSize, some } from "lodash";
import {
  BsDash,
  BsGithub,
  BsInfoCircle,
  BsInstagram,
  BsPlus,
  BsQuestion,
  BsXLg,
} from "react-icons/bs";
import { LuDices, LuSave } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";
interface ChampionType
  extends RiotAPITypes.DDragon.DDragonChampionListDataDTO { }

enum ChampionsTypeEnum {
  "Fighter" = "Lutador",
  "Tank" = "Tank",
  "Mage" = "Mago",
  "Assassin" = "Assassino",
  "Marksman" = "Atirador",
  "Support" = "Suporte",
}
interface ChampionListProps {
  championsDTO?: RiotAPITypes.DDragon.DDragonChampionListDTO;
}
interface Option {
  value: string;
  label: string;
}

interface Composition {
  id: string;
  version: string;
  data: {
    champions: ChampionType[];
  };
}
interface ToastProps {
  action: string;
  id: string;
  message: string;
}

export default function ChampionList({ championsDTO }: ChampionListProps) {
  const [championsList, setChampionsList] = useState<ChampionType[] | null>(
    Object.values(championsDTO?.data || {}) || null
  );
  const [selectedChamps, setSelectedChamps] = useState<ChampionType[] | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<Option[] | null>(null);
  const [savedCompositions, setSavedCompositions] = useState<
    Composition[] | null
  >(null);
  const [options, setOptions] = useState<Option[] | null>(
    getChampionsTypeOptions()
  );
  const [fakeIsLoading, setFakeIsLoading] = useState(true);
  const toast = useToast();

  function generateUniqueToast({ action, id, message }: ToastProps) {
    const toastId = `${action}-${id}`;
    !toast.isActive(toastId) &&
      toast({
        id,
        title: message,
      });
  }

  function getChampionsTypeOptions() {
    const options: Option[] = Object.entries(ChampionsTypeEnum).map(
      ([value, label]) => {
        return {
          value,
          label,
        };
      }
    );
    return options || null;
  }

  async function FakeLoader(time: number = 1000) {
    setFakeIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, time));
    setFakeIsLoading(false);
  }
  function loadCompositionsFromLocalStorage() {
    const localStorageData = localStorage.getItem("compositions") || null;
    const parsed = !!localStorageData
      ? (JSON.parse(localStorageData) as Composition[])
      : null;
    if (!!parsed) {
      const needsToUpadateVersion =
        parsed.filter((comp) => comp.version !== championsDTO?.version)
          .length !== 0;
      if (needsToUpadateVersion) {
        alert(
          "Nova versão do LoL detectada. Atualizando banco de dados local..."
        );
        const updatedCompositions: Composition[] = parsed.map((comp) => {
          return {
            id: comp.id,
            version: championsDTO?.version || "13.11.1",
            data: {
              ...comp.data,
              champions: comp.data.champions.map(
                (champ) => championsDTO?.data[champ.name] || champ
              ),
            },
          };
        });
        try {
          localStorage.setItem(
            "compositions",
            JSON.stringify(updatedCompositions)
          );
        } catch (error) {
          alert("Falha ao aplicar atualização.");
        }
        setSavedCompositions(updatedCompositions);
        return;
      }
    }
    setSavedCompositions(parsed);
  }

  function saveCompositionsToLocalStorage(composition: Composition | null) {
    let isSaveAllowed = true;

    savedCompositions?.forEach((comp) => {
      if (isEqual(comp?.data.champions, composition?.data.champions)) {
        isSaveAllowed = false;
      }
    });

    if (!isSaveAllowed) {
      generateUniqueToast({
        action: "create-error",
        id: composition?.id || uuidv4(),
        message:
          "Não é possível salvar a mesma composição mais de uma vez, nem uma composição vazia.",
      });
      return;
    }

    let upadatedCompositions = [
      ...new Set([
        ...(!!savedCompositions ? savedCompositions : []),
        ...(!!composition ? [composition] : []),
      ]),
    ];

    try {
      localStorage.setItem(
        "compositions",
        JSON.stringify(upadatedCompositions)
      );
    } catch (error) {
      alert("Erro ao salver composição!");
      return;
    }
    setSavedCompositions(upadatedCompositions);
  }

  function deleteCompositionsToLocalStorage(compositionId: string) {
    const upadatedCompositions =
      savedCompositions?.filter((item) => item.id !== compositionId) || null;
    try {
      localStorage.setItem(
        "compositions",
        JSON.stringify(upadatedCompositions)
      );
    } catch (error) {
      alert("Erro ao salver composição!");
      return;
    }
    setSavedCompositions(upadatedCompositions);
  }

  useEffect(() => {
    loadCompositionsFromLocalStorage();
  }, []);

  useEffect(() => {
    FakeLoader(850);
  }, []);

  function rollChampions() {
    if (
      selectedOptions === null ||
      selectedOptions?.length === 6 ||
      selectedOptions?.length === 0
    ) {
      const randomChamps = sampleSize(championsList, 5) || null;
      setSelectedChamps(randomChamps);
      return;
    }

    const filteredChampions = filter(championsList, (champion) => {
      const temp = selectedOptions.map((item) => item.value);
      let isMatch = false;
      temp.forEach((item) => {
        if (champion?.tags.includes(item)) {
          isMatch = true;
        }
      });
      return isMatch;
    });

    const randomChamps = sampleSize(filteredChampions, 5) || null;
    setSelectedChamps(randomChamps);
    return;
  }

  function getChampionStatsAsKeyValueArray(champion: ChampionType) {
    const statsMap = new Map(Object.entries(champion.stats))
    return [...statsMap]
  }

  return (
    <>
      <Box display={"none"} position={"absolute"} zIndex={-50}>
        {!!championsList &&
          championsList.map((champion) => (
            <Image
              fill
              quality={50}
              alt="a"
              key={champion?.id}
              loading="eager"
              decoding="async"
              src={
                "http://ddragon.leagueoflegends.com/cdn/" +
                championsDTO?.version +
                "/img/champion/" +
                champion?.image?.full
              }
            />
          ))}
      </Box>
      <HStack
        fontSize={"xs"}
        py={1}
        gap={0}
        backgroundColor={"gray.50"}
        width={"full"}
        mx={"auto"}
        justifyContent={"center"}
      >
        <Text mr={0.5}>Feito por</Text>
        <Popover isLazy>
          <PopoverTrigger>
            <Text cursor={"pointer"} textDecoration={"underline"}>
              aNLukinha
            </Text>
          </PopoverTrigger>
          <PopoverContent
            maxWidth={"180px"}
            boxShadow={"none !important"}
            outline={"none"}
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Contatos</PopoverHeader>
            <PopoverBody>
              <HStack
                as={Link}
                width={"fit-content"}
                target="_blank"
                href="https://github.com/lucarampi"
              >
                <Icon as={BsGithub} /> <Text>Github</Text>
              </HStack>
              <HStack
                as={Link}
                width={"fit-content"}
                target="_blank"
                href="https://www.instagram.com/luca.rampi_/"
              >
                <Icon as={BsInstagram} /> <Text>Instagram</Text>
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <Text>, um </Text>
        <Image
          mx={0.5}
          width={6}
          height={6}
          src={"/gold_icon.png"}
          unoptimized
          alt={"Gold icon"}
        />
        <Text>afundado.</Text>
      </HStack>
      <Container pb={10} zIndex={0} maxW={"3xl"}>
        <Stack
          direction={"column"}
          spacing={3}
          align={"center"}
          alignSelf={"center"}
          position={"relative"}
          py={{ base: 20, md: 20 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "2xl", md: "5xl" }}
            mb={2}
          >
            Não sabe do que jogar? <br />
          </Heading>
          {!!selectedChamps ? (
            <Stack wrap={"wrap"} direction={"row"}>
              {selectedChamps?.map((champion) => (
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
                        <HStack gap={1} alignItems={"center"} justifyContent={array.length - 1 == index ? "center" : "start"}>
                          <Image alt={value[0]} src={`/stats/${value[0]}.webp`} width={3.5} height={3.5} /> <Text>: {value[1]}</Text>
                        </HStack>
                      </GridItem>)}

                    </Grid>
                  </Box>}
                  key={champion?.name}
                >
                  <Box
                    cursor={"pointer"}
                    position={"relative"}
                    width={[14, 16, 20]}
                    height={[14, 16, 20]}
                  >
                    <Image
                      quality={50}
                      fill
                      src={
                        "http://ddragon.leagueoflegends.com/cdn/" +
                        championsDTO?.version +
                        "/img/champion/" +
                        champion?.image?.full
                      }
                      alt={champion?.name}
                    />
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          ) : (
            <Stack direction={"row"}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  border={"2px"}
                  key={i}
                  width={[14, 16, 20]}
                  height={[14, 16, 20]}
                  as={BsQuestion}
                />
              ))}
            </Stack>
          )}

          <Stack alignItems={"center"} gap={3} mt={3} direction={"column"}>
            <HStack
              wrap={"wrap"}
              alignItems={"center"}
              justifyContent={"center"}
              spacing={2}
            >
              {options?.map((option) => (
                <Button
                  as={Tag}
                  size={["sm"]}
                  key={option.value}
                  alignItems={"center"}
                  justifyContent={"center"}
                  borderRadius="full"
                  variant="solid"
                  isDisabled={fakeIsLoading}
                  onClick={() =>
                    setSelectedOptions((oldOptions) => {
                      const isSelected = some(selectedOptions, {
                        value: option.value,
                        label: option.label,
                      });
                      if (isSelected) {
                        const newOptions = oldOptions?.filter(
                          (item) =>
                            item.label !== option.label &&
                            item.value !== option.value
                        );
                        return [...new Set(newOptions)] || null;
                      }
                      if (oldOptions == null) {
                        return [...new Set([option])] || null;
                      }

                      return [...new Set([...oldOptions, option])] || null;
                    })
                  }
                  colorScheme={
                    some(selectedOptions, {
                      value: option.value,
                      label: option.label,
                    })
                      ? "messenger"
                      : "gray"
                  }
                >
                  <TagLabel>{option.label}</TagLabel>
                  <TagRightIcon>
                    {some(selectedOptions, {
                      value: option.value,
                      label: option.label,
                    }) ? (
                      <BsDash size={28} />
                    ) : (
                      <BsPlus size={28} />
                    )}
                  </TagRightIcon>
                </Button>
              ))}
            </HStack>
            <HStack
              wrap={"wrap"}
              alignItems={"center"}
              justifyContent={"center"}
              spacing={2}
            >
              <Button
                colorScheme={"gray"}
                onClick={() => {
                  if (!selectedChamps) {
                    alert("Não foi possível salvar a composição");
                    return;
                  }
                  saveCompositionsToLocalStorage({
                    id: uuidv4(),
                    version: championsDTO?.version || "13.11.1",
                    data: {
                      champions: selectedChamps,
                    },
                  });
                }}
                isLoading={fakeIsLoading}
              >
                <LuSave size={20} />
              </Button>

              <Button
                colorScheme={"messenger"}
                onClick={rollChampions}
                rightIcon={<LuDices size={20} />}
                isLoading={fakeIsLoading}
              >
                Sortear composição
              </Button>
            </HStack>
          </Stack>
        </Stack>
        <Heading
          fontWeight={600}
          fontSize={{ base: "xl", sm: "xl", md: "2xl" }}
          mb={2}
        >
          Composições salvas:
        </Heading>

        <VStack align={["center", "start"]} mt={4}>
          {!!savedCompositions && savedCompositions.length > 0 ? (
            savedCompositions?.map((composition, index) => (
              <Stack direction={"row"} align={"center"} key={composition.id}>
                <Stack wrap={"wrap"} direction={"row"} alignItems={"center"}>
                  {composition?.data.champions.map((champion) => (
                    <Box
                      position={"relative"}
                      key={champion?.id}
                      width={["10", "12"]}
                      height={["10", "12"]}
                    >
                      <Image
                        quality={50}
                        fill
                        src={
                          "http://ddragon.leagueoflegends.com/cdn/" +
                          championsDTO?.version +
                          "/img/champion/" +
                          champion?.image?.full
                        }
                        alt={champion?.name}
                      />
                    </Box>
                  ))}
                </Stack>
                <Icon
                  textColor={"gray.400"}
                  _hover={{ textColor: "gray.700", cursor: "pointer" }}
                  aria-label="Deletar composição"
                  onClick={() => {
                    deleteCompositionsToLocalStorage(composition.id);
                  }}
                  as={BsXLg}
                />
              </Stack>
            ))
          ) : (
            <HStack
              width={"full"}
              backgroundColor={"gray.100"}
              rounded={"md"}
              justifyContent={"center"}
              alignItems={"center"}
              height={["10", "12"]}
            >
              <Icon as={BsInfoCircle} />

              <Text textColor={"gray.600"} textAlign={"center"}>
                Nada aqui
              </Text>
            </HStack>
          )}
        </VStack>
      </Container>
    </>
  );
}

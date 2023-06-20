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
  Input,
  InputGroup,
  InputLeftElement,
  Kbd,
  Link,
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
import { Id, toast } from "react-toastify";
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

import { SlMagnifier } from "react-icons/sl";
import { LuDices, LuPhoneIncoming, LuSave } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";
import ChampionImage from "./ChampionImage";
export interface ChampionType
  extends RiotAPITypes.DDragon.DDragonChampionListDataDTO {}

export enum ChampionsTypeEnum {
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

export default function ChampionList({ championsDTO }: ChampionListProps) {
  const [searchText, setSearchText] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
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
          notifyFinishUpdateDatabase("error");
          return;
        }
        setSavedCompositions(() => {
          notifyFinishUpdateDatabase("success");
          return updatedCompositions;
        });
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
      notifySaveDuplicatedError();
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
      notifySaveError();
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
      notifyDeleteError();
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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "/") {
        setSearchVisible((prevVisible) => !prevVisible);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
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

  return (
    <>
      <Box display={"none"} position={"absolute"} zIndex={-50}>
        {!!championsList &&
          championsList.map((champion) => (
            <Image
              fill
              alt="a"
              quality={50}
              key={champion?.id}
              loading="eager"
              decoding="async"
              sizes="(max-width: 768px) 1vw, (max-width: 1200px) 1vw, 1vw"
              src={getChampionSquareImageSrc(
                champion.version,
                champion.image.full
              )}
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
          mt={20}
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
                <ChampionImage key={champion.id} champion={champion} />
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
                    notifySaveEmptyError();
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
        <Box width={"full"} paddingY={6}>
          <Text fontSize={"md"} textAlign={"center"} textColor={"gray.400"}>
            Digite
            <Kbd
              marginX={1.5}
              borderColor={"gray.400"}
              colorScheme="blackAlpha"
            >
              /
            </Kbd>
            para procurar um campeão específico.
          </Text>
        </Box>
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
                        fill
                        quality={50}
                        sizes="(max-width: 768px) 1vw, (max-width: 1200px) 1vw, 1vw"
                        src={getChampionSquareImageSrc(
                          champion.version,
                          champion.image.full
                        )}
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
      <Modal
        scrollBehavior="inside"
        isOpen={searchVisible}
        onClose={() => setSearchVisible(false)}
      >
        <ModalOverlay />
        <ModalContent backdropBlur={0.3}>
          <ModalHeader
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            paddingTop={0}
            paddingBottom={0}
            paddingX={1}
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SlMagnifier color="gray.300" />
              </InputLeftElement>
              <Input
                value={searchText}
                boxShadow={"none !important"}
                placeholder={"Digitar o nome de um campeão..."}
                border={0}
                onChange={(ev) => {
                  const regex = /[^\p{L}\s´`']/gu;
                  const formattedString = ev.target.value.replace(regex, "");
                  setSearchText(formattedString);
                }}
              />
            </InputGroup>
          </ModalHeader>
          <ModalBody padding={!!searchText && !!searchText.trim() ? 2 : 0}>
            <VStack
              width={"full"}
              justifyContent={"space-between"}
              alignItems={"start"}
              paddingX={2}
            >
              {!!searchText &&
                !!searchText.trim() &&
                championsList
                  ?.filter(
                    (champ) =>
                      champ.id
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                      champ.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                  )
                  .map((temp) => (
                    <HStack
                      width={"full"}
                      key={temp.id}
                      justifyContent={"space-between"}
                      paddingRight={2}
                      cursor={"pointer"}
                      _hover={{
                        backgroundColor:"gray.200"
                      }}
                    >
                      <HStack>
                        <Image
                          rounded={"sm"}
                          width={50}
                          height={50}
                          alt="a"
                          quality={50}
                          key={temp?.id}
                          loading="eager"
                          decoding="async"
                          sizes="(max-width: 768px) 1vw, (max-width: 1200px) 1vw, 1vw"
                          src={getChampionSquareImageSrc(
                            temp.version,
                            temp.image.full
                          )}
                        />
                        <Text> {temp.name}</Text>
                      </HStack>
                      <Tag size={"sm"}>
                        {temp?.tags
                          .map(
                            (tag) =>
                              ChampionsTypeEnum[
                                tag as keyof typeof ChampionsTypeEnum
                              ]
                          )
                          .join(" | ")}
                      </Tag>
                    </HStack>
                  ))}
            </VStack>
          </ModalBody>
          <ModalFooter py={1}>
            <Text
              width={"full"}
              textAlign={"center"}
              fontSize={"xs"}
              textColor={"gray.300"}
            >
              Funcionalidade em beta
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export function getChampionStatsAsKeyValueArray(champion: ChampionType) {
  const statsMap = new Map(Object.entries(champion.stats));
  return [...statsMap];
}

export function getChampionSquareImageSrc(version: string, imageSrc: string) {
  return (
    "http://ddragon.leagueoflegends.com/cdn/" +
    version +
    "/img/champion/" +
    imageSrc
  );
}

export function getChampionSplashImageSrc(id: string, num: number = 0) {
  const formatedSplashName = `${id}_${num}.jpg`;
  return `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formatedSplashName}`;
}

//utils

function notifySaveDuplicatedError() {
  toast.error("Não é possível salvar a mesma composição mais de uma vez!", {
    position: "bottom-center",
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    toastId: "save_duplicated_composition_not_allowed",
  });
}

function notifySaveEmptyError() {
  toast.error("Não é possível salvar uma composição vazia!", {
    position: "bottom-center",
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    toastId: "save_empty_composition_not_allowed",
  });
}

function notifySaveError() {
  toast.error("Erro ao salvar composição!", {
    position: "bottom-center",
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    toastId: "save_error",
  });
}

function notifyDeleteError() {
  toast.error("Erro ao deletar composição!", {
    position: "bottom-center",
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    toastId: "save_error",
  });
}

// function notifyUpdatingDatabase() {
//   return toast.loading("Atualizando banco de dados.", {
//     position: "bottom-center",
//     hideProgressBar: true,
//     closeOnClick: true,
//     pauseOnHover: false,
//     draggable: true,
//     progress: undefined,
//     theme: "light",
//     toastId: "update_database",
//   });
// }

function notifyFinishUpdateDatabase(status: "success" | "error") {
  switch (status) {
    case "success":
      return toast.success("Banco de dados atualizado com sucesso!", {
        position: "bottom-center",
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: "update_database_success",
      });
    case "error":
      return toast.error(
        "Erro ao atualizar banco de dados! Recarregue a página quando possível.",
        {
          position: "bottom-center",
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          toastId: "update_database_error",
        }
      );

    default:
      return toast.error(
        "Algo deu errado... Recarregue a página quando possível.",
        {
          position: "bottom-center",
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          toastId: "update_database_error",
        }
      );
  }
}

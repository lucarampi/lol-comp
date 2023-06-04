"use client";

import { useState } from "react";
import {
  Button,
  Container,
  HStack,
  Heading,
  Icon,
  Stack,
  Tag,
  TagLabel,
  TagRightIcon,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/next-js";
import { RiotAPITypes } from "@fightmegg/riot-api";
import { filter, includes, sampleSize, some } from "lodash";
import { BsDash, BsPlus, BsQuestion } from "react-icons/bs";
import { LuDices } from "react-icons/lu";

interface ChampionType
  extends RiotAPITypes.DDragon.DDragonChampionListDataDTO {}

enum ChampionsTypeEnum {
  "Fighter" = "Lutador",
  "Tank" = "Tank",
  "Mage" = "Mago",
  "Assassin" = "Assassino",
  "Marksman" = "Atirador",
  "Support" = "Suporte",
}
interface ChampionListProps {
  championsList?: ChampionType[];
}
interface Option {
  value: string;
  label: string;
}

export default function ChampionList({ championsList }: ChampionListProps) {
  const [selectedChamps, setSelectedChamps] = useState<ChampionType[] | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<Option[] | null>(null);
  const [options, setOptions] = useState<Option[] | null>(
    getChampionsTypeOptions()
  );

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
      //@ts-ignore
      return includes(champion?.tags, ...temp);
    });

    const randomChamps = sampleSize(filteredChampions, 5) || null;
    setSelectedChamps(randomChamps);
    return;
  }
  const filteredChampions = (
    name: string,
    champions?: RiotAPITypes.DDragon.DDragonChampionListDataDTO[]
  ) => {
    console.log(name);
    if (!champions || champions.length == 0) {
      return [] as RiotAPITypes.DDragon.DDragonChampionListDataDTO[];
    }
    if (name?.trim().length === 0) {
      return champions;
    }
    return champions?.filter((item) =>
      item.name.toLocaleLowerCase().includes(name?.trim().toLowerCase())
    );
  };
  const championsTags = new Set(
    championsList?.map((champ) => champ.tags).flat()
  );

  return (
    <Container maxW={"3xl"}>
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
              <Image
                width={16}
                height={16}
                quality={"100"}
                key={champion?.name}
                src={
                  "http://ddragon.leagueoflegends.com/cdn/" +
                  champion?.version +
                  "/img/champion/" +
                  champion?.image?.full
                }
                alt={champion?.name}
                unoptimized
                
              />
            ))}
          </Stack>
        ) : (
          <Stack direction={"row"}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                border={"2px"}
                key={i}
                width={16}
                height={16}
                as={BsQuestion}
              />
            ))}
          </Stack>
        )}

        <Stack alignItems={"center"} gap={3} mt={3} direction={"column"}>
          <HStack wrap={"wrap"} justifyContent={"center"} spacing={2}>
            {options?.map((option) => (
              <Tag
                size={"lg"}
                key={option.value}
                alignItems={"center"}
                borderRadius="full"
                variant="solid"
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
                    <BsPlus size={26} />
                  ) : (
                    <BsDash size={26} />
                  )}
                </TagRightIcon>
              </Tag>
            ))}
          </HStack>
          <Button
            colorScheme={"messenger"}
            onClick={rollChampions}
            rightIcon={<LuDices size={20} />}
          >
            Sortear composição
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

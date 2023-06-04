"use client"

import { useState } from "react"
import Head from "next/head"
import {
  Button,
  Container,
  Heading,
  Icon,
  Image,
  Stack
} from "@chakra-ui/react"
import { RiotAPITypes } from "@fightmegg/riot-api"
import {sampleSize} from "lodash"
import { BsQuestion } from "react-icons/bs"
import { LuDices } from "react-icons/lu"

interface ChampionType
  extends RiotAPITypes.DDragon.DDragonChampionListDataDTO {}
interface ChampionListProps {
  championsList?: ChampionType[]
}

export default function ChampionList({ championsList }: ChampionListProps) {
  const [selectedChamps, setSelectedChamps] = useState<ChampionType[] | null>(
    null
  )
  function rollChampions() {
    const randomChamps = sampleSize(championsList, 5) || null
    setSelectedChamps(randomChamps)
  }
  const filteredChampions = (
    name: string,
    champions?: RiotAPITypes.DDragon.DDragonChampionListDataDTO[]
  ) => {
    console.log(name)
    if (!champions || champions.length == 0) {
      return [] as RiotAPITypes.DDragon.DDragonChampionListDataDTO[]
    }
    if (name?.trim().length === 0) {
      return champions
    }
    return champions?.filter((item) =>
      item.name.toLocaleLowerCase().includes(name?.trim().toLowerCase())
    )
  }

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
                rounded={"sm"}
                key={champion?.name}
                src={
                  "http://ddragon.leagueoflegends.com/cdn/" +
                  champion?.version +
                  "/img/champion/" +
                  champion?.image?.full
                }
                alt={champion?.name}
              />
            ))}
          </Stack>
        ) : (
          <Stack direction={"row"}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon border={"2px"} key={i} width={16} height={16} as={BsQuestion} />
            ))}
          </Stack>
        )}

        <Button
          mt={3}
          colorScheme={"messenger"}
          onClick={rollChampions}
          rightIcon={<LuDices size={20} />}
        >
          Sortear composição
        </Button>
      </Stack>
    </Container>
  )
}

import { PlatformId, RiotAPI, RiotAPITypes } from "@fightmegg/riot-api"

import api from "@/lib/axios"
import ChampionContainer from "@/components/ChampionList"

const getAllChampions = (url: string) => api.get<RiotAPITypes.DDragon.DDragonChampionListDTO>(url).then((res) => res?.data?.data)

export default async function IndexPage() {
  const res = (await getAllChampions(
    "/api/champions"
  ))
  const championsList = Object.values(res || {})

  // console.log(champions)
  return (
    <section className="container px-8 pb-8 pt-6">
      {!!championsList && <ChampionContainer championsList={championsList} />}
    </section>
  )
}

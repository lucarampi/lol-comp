import { RiotAPITypes } from "@fightmegg/riot-api";

import api from "@/lib/axios";
import ChampionContainer from "@/components/ChampionList";

const getAllChampions = (url: string) =>
  api
    .get<RiotAPITypes.DDragon.DDragonChampionListDTO>(url)
    .then((res) => res?.data);

export default async function IndexPage() {
  const res = await getAllChampions("/api/champions");
  const championsList = Object.values(res || {});
  // console.log(res);
  // console.log(champions)

  return (
    <>
      <section
      >
        {!!championsList && <ChampionContainer championsDTO={res} />}
      </section>
    </>
  );

}
export const revalidate = 900;

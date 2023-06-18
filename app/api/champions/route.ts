import { NextResponse } from 'next/server';

import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api'

const riotApi = new RiotAPI(process.env.RGAPI_KEY || "");


export async function GET() {
    const res = (await riotApi.ddragon.champion.all({locale: RiotAPITypes.DDragon.LOCALE.pt_BR}))

    return NextResponse.json({ ...res })
}
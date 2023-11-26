import { NextRequest, NextResponse } from 'next/server';

import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api'

const riotApi = new RiotAPI(process.env.RGAPI_KEY || "");

export const fetchCache = 'force-no-store'

export async function  GET(req:NextRequest) {
    const path =req.nextUrl.searchParams.get("path")|| "/"

    const res = (await riotApi.ddragon.champion.all({locale: RiotAPITypes.DDragon.LOCALE.pt_BR}))

    return NextResponse.json({ ...res })
}
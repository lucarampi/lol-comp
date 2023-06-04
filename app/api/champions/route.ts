import { NextResponse } from 'next/server';

import { RiotAPI } from '@fightmegg/riot-api'

const riotApi = new RiotAPI(process.env.RGAPI_KEY || "");


export async function GET() {
    const res = await riotApi.ddragon.champion.all()

    return NextResponse.json({ ...res })
}
import { NextResponse } from 'next/server';

import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api'

const riotApi = new RiotAPI(process.env.RGAPI_KEY || "");

interface ApiErrorMessage {
    message: string;
}

export async function GET(request: Request,
    { params }: { params: { id?: string } }) {

    let championId = ""

    if (!!params?.id && !!params?.id.trim()) {
        championId = params.id
    }
    else {
        const errorMessage: ApiErrorMessage = {
            message: "Campeão não encontrado."
        }
        return NextResponse.json({ ...errorMessage }, { status: 422, statusText: "422" })
    }

    try {
        const res = await riotApi.ddragon.champion.byName({ locale: RiotAPITypes.DDragon.LOCALE.pt_BR, championName: championId })

        if (!!res && !!res?.data) {
            return NextResponse.json(res, { status: 200, statusText: "200" })
        }

    } catch (error) {
        const errorMessage: ApiErrorMessage = {
            message: "Campeão não encontrado."
        }
        return NextResponse.json({ ...errorMessage }, { status: 404, statusText: "404" })
    }

    const errorMessage: ApiErrorMessage = {
        message: "Erro de servidor, favor contatar administrador."
    }
    return NextResponse.json({ ...errorMessage }, { status: 500, statusText: "500" })

}


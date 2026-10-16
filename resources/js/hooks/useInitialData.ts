import {useQuery} from '@tanstack/react-query';

//型エイリアス
export type Terrain = {
    code: string,
    name: string,
    can_pass?: boolean, // 任意
    is_developable?: boolean, // 任意
    [key: string]: any //キーが任意のstring型
};

type InitialDataResponse = {
    terrains: Terrain[]
};

export const useInitialData = () => {
    return useQuery<InitialDataResponse>({
        queryKey: ['initial-data'],
        queryFn: async () => {
            const res = await fetch('/api/initial-data');
            if (!res.ok) throw new Error('Failed to fetch initial data');
            return res.json();
        },
        // ★超重要: マスターデータなので自動破棄・再取得をさせず無限キャッシュにする
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

// terrains だけをサクッと取り出したい時用のヘルパーフック
export const useTerrains = () => {
    const {data, ...rest} = useInitialData();
    return {
        terrains: data?.terrains ?? [],
        ...rest,
    };
};

import {useQuery} from '@tanstack/react-query';

//型エイリアス
export type User = {
    [key: string]: any //キーが任意のstring型
};

type InitialDataResponse = {
    user: User,
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
export const useUser = () => {
    const {data, ...rest} = useInitialData();
    return {
        user: data?.user ?? [],
        ...rest,
    };
};

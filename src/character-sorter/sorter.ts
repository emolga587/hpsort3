/**
 * キャラソートを行うクラス
 * @template T ソート対象配列の型
 */
export class Sorter<T> {
    /**
     * @param target ソート対象の配列
     * @param progress 途中経過の配列(optional)
     */
    constructor(target: T[], state?: SorterState<T>) {
        if (state) {
            this.state = state;
        } else {
            this.state.priorArray = shuffle(target);
        }
    }

    /**
     * ソートの状態
     */
    state: SorterState<T> = {
        selections: [],
        priorArray: []
    };

    /**
     * ソート完了フラグ
     */
    finished = false;

    /**
     * 進捗度
     */
    private rawProgress = 0;

    /**
     * 進捗率(%)
     */
    progress = 0;

    /**
     * state.selectionsを参照し、大きい方を返却する
     * (選択肢が未定義の場合はSelectionUndefinedError例外)
     * @param a 選択肢A
     * @param b 選択肢B
     * @returns a, b, undefined(引き分け)
     */
    private compare = (a: T, b: T) => {
        for (let selection of this.state.selections) {
            if (selection.win?.includes(a) && selection.lose?.includes(b)) {
                return a;
            } else if (selection.win?.includes(b) && selection.lose?.includes(a)) {
                return b;
            } else if (selection.tie?.includes(a) && selection.tie?.includes(b)) {
                return undefined;
            }
        }

        throw new SelectionUndefinedError(a, b);
    }

    /**
     * 選択結果を追加する
     * @param selection 選択結果
     */
    addSelection(selection: SorterSelection<T>) {
        this.state.selections.push(selection);
    }

    /**
     * ソートを行う
     * @param num 上位何人までソートを行うか 
     * @returns ソート結果(未定義の選択肢がある場合はSelectionUndefinedError例外)
     */
    sort(num = Infinity) {
        /**
         * ソート結果
         */
        const result: T[][] = [];

        /**
         * 二分探索に用いるrightを求める(上位num位まで求める際に使用)
         * @returns rightの位置
         */
        const calcurateRight = () => {
            let i: number;
            let sum = 0;
            for (i = 0; i < result.length; i++) {
                sum += result[i].length;
                if (sum >= num) {
                    break;
                }
            }
            return i;
        }

        // 進捗率を設定する
        this.progress = this.calcurateProgress(num);

        // 各要素について二分探索を行い挿入する
        binaryInsertion: for (this.rawProgress = 0; this.rawProgress < this.state.priorArray.length; this.rawProgress++) {
            const challenger = this.state.priorArray[this.rawProgress];

            let left = 0;
            let right = calcurateRight();
            let target = [challenger];
            while (left < right) {
                const mid = Math.floor((left + right) / 2);
                // challengerと、midの位置の要素を比較する
                switch (this.compare(challenger, result[mid][0])) {
                    // challengerが勝利した場合
                    case challenger:
                        right = mid;
                        break;
                    // midが勝利した場合
                    case result[mid][0]:
                        left = mid + 1;
                        break;
                    // 引き分けの場合
                    default:
                        result[mid].push(challenger);
                        continue binaryInsertion;
                }
            }
            result.splice(left, 0, target);
        }
        this.progress = this.calcurateProgress();
        this.finished = true;
        return result.slice(0, num);
    }

    /**
     * ソートの進捗率を求める
     * @param num 上位何位までソートを行うか
     * @returns 進捗率(%、小数点以下四捨五入)
     */
    calcurateProgress(num = Infinity) {
        let total = 0;
        for (let i = 1; i <= this.state.priorArray.length; i++) {
            total += Math.log2(Math.min(i, num));
        }
        let current = 0;
        for (let i = 1; i <= this.rawProgress; i++) {
            current += Math.log2(Math.min(i, num));
        }
        return Math.round(current / total * 100);
    }

    get round() {
        return this.state.selections.length;
    }
}

/**
 * 選択未定義エラーのクラス
 */
export class SelectionUndefinedError<T> extends Error {
    /**
     * @param a 選択肢A
     * @param b 選択肢B
     * @param message エラーメッセージ
     */
    constructor(a: T, b: T, message?: string) {
        super(message);
        this.name = "SelectionUndefinedError";
        this.selection = [a, b];
    }

    selection: T[] = [];
}

/**
 * ソートの状態
 */
interface SorterState<T> {
    /**
     * 初期の配列
     */
    priorArray: T[];
    /**
     * 選択
     */
    selections: SorterSelection<T>[];
}

/**
 * ソートの選択結果
 */
interface SorterSelection<T> {
    win?: T[],
    lose?: T[],
    tie?: T[]
}

/**
 * 配列の要素をシャッフルする
 * @param target シャッフルする配列
 * @returns シャッフルされた配列
 */
export const shuffle = <T>(target: T[]) => {
    let array = [...target];

    for (let i = array.length; 1 < i; i--) {
        let k = Math.floor(Math.random() * i);
        [array[k], array[i - 1]] = [array[i - 1], array[k]];
    }

    return array;
};
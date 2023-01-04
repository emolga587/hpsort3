import { Sorter, SelectionUndefinedError, shuffle } from "./sorter";

const MEMBER_NUM = 66;

describe("ヘルパー関数・クラス", () => {
    test("SelectionNotDefinedError", () => {
        try {
            throw new SelectionUndefinedError("a", "b");
        } catch (e) {
            if (e instanceof SelectionUndefinedError) {
                expect(e.selection).toContain("a");
                expect(e.selection).toContain("b");
            } else {
                throw new Error("test failed");
            }
        }
    });

    test("shuffle", () => {
        const shuffleResult = shuffle(["a", "b", "c"]);
        expect(shuffleResult).toContain("a");
        expect(shuffleResult).toContain("b");
        expect(shuffleResult).toContain("c");
        expect(shuffleResult).toHaveLength(3);
    });
});

describe("Soterクラス", () => {
    test("全要素のソート", () => {
        const sorter = new Sorter([...Array(MEMBER_NUM)].map((_, i) => i));
        let count = 0;
        while (!sorter.finished) {
            try {
                expect(sorter.round).toBe(count);
                const result = sorter.sort();
                expect(sorter.progress).toBe(100);
                for (let i = 1; i < result.length; i++) {
                    expect(result[i - 1][0]).toBeGreaterThan(result[i][0]);
                }
                expect(sorter.round).toBe(count);
                expect(result).toHaveLength(MEMBER_NUM);
                console.debug("全順位の比較回数:", count);
            } catch (e) {
                count++;
                if (e instanceof SelectionUndefinedError) {
                    if (e.selection[0] > e.selection[1]) {
                        sorter.addSelection({
                            win: [e.selection[0]],
                            lose: [e.selection[1]]
                        });
                    } else {
                        sorter.addSelection({
                            win: [e.selection[1]],
                            lose: [e.selection[0]]
                        });
                    }
                } else {
                    throw e;
                }
            }
        }
    });

    test("66要素のソート(上位10位)", () => {
        const sorter = new Sorter([...Array(MEMBER_NUM)].map((_, i) => i));
        let count = 0;
        while (!sorter.finished) {
            try {
                expect(sorter.round).toBe(count);
                const result = sorter.sort(10);
                expect(sorter.progress).toBe(100);
                for (let i = 1; i < result.length; i++) {
                    expect(result[i - 1][0]).toBeGreaterThan(result[i][0]);
                }
                expect(result).toHaveLength(10);
                expect(sorter.round).toBe(count);
                console.debug("上位10位までの比較回数:", count);
            } catch (e) {
                count++;
                if (e instanceof SelectionUndefinedError) {
                    if (e.selection[0] > e.selection[1]) {
                        sorter.addSelection({
                            win: [e.selection[0]],
                            lose: [e.selection[1]]
                        });
                    } else {
                        sorter.addSelection({
                            win: [e.selection[1]],
                            lose: [e.selection[0]]
                        });
                    }
                } else {
                    throw e;
                }
            }
        }
    });

    test("66要素のソート(0-9は引き分け)", () => {
        const sorter = new Sorter([...Array(MEMBER_NUM)].map((_, i) => i));
        let count = 0;
        while (!sorter.finished) {
            try {
                expect(sorter.round).toBe(count);
                const result = sorter.sort();
                expect(sorter.progress).toBe(100);
                for (let i = 1; i < result.length; i++) {
                    expect(result[i - 1][0]).toBeGreaterThan(result[i][0]);
                }
                expect(result).toHaveLength(57);
                expect(result[result.length - 1]).toHaveLength(10);
                expect(sorter.round).toBe(count);
                console.debug("引き分け10個の比較回数:", count);
            } catch (e) {
                count++;
                if (e instanceof SelectionUndefinedError) {
                    if (e.selection[0] < 10 && e.selection[1] < 10) {
                        sorter.addSelection({
                            tie: [e.selection[0], e.selection[1]]
                        });
                    } else if (e.selection[0] > e.selection[1]) {
                        sorter.addSelection({
                            win: [e.selection[0]],
                            lose: [e.selection[1]]
                        });
                    } else {
                        sorter.addSelection({
                            win: [e.selection[1]],
                            lose: [e.selection[0]]
                        });
                    }
                } else {
                    throw e;
                }
            }
        }
    });
});
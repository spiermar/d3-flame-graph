declare module "d3-flame-graph" {
    export function flamegraph(): FlameGraph;
    export interface StackFrame {
        name: string;
        value: number;
        children: StackFrame[];
    }

    type LabelHandler = (node: any) => string;
    type ClickHandler = (node: any) => void;
    type DetailsHandler = (node: any) => void;
    type SearchHandler = (results: any, sum: any, totalValue: any) => void;
    type ColorMapper = (node: any, originalColor: string) => string;
    type SearchMatch = (node: any, term: string) => boolean;

    interface FlameGraph {
        (selection: any): any;

        selfValue(val: boolean): FlameGraph;
        selfValue(): boolean;
        width(val: number): FlameGraph;
        width(): number;
        height(val: number): FlameGraph;
        height(): number;
        cellHeight(val: number): FlameGraph;
        cellHeight(): number;
        minFrameSize(val: number): FlameGraph;
        minFrameSize(): number;
        title(val: string): FlameGraph;
        title(): string;
        tooltip(val: boolean): FlameGraph;
        tooltip(): boolean;
        transitionDuration(val: number): FlameGraph;
        transitionDuration(): number;
        transitionEase(val: string): FlameGraph;
        transitionEase(): string;
        label(val: LabelHandler): FlameGraph;
        label(): LabelHandler;
        sort(val: boolean): FlameGraph;
        sort(): boolean;
        inverted(val: boolean): FlameGraph;
        inverted(): boolean;
        computeDelta(val: boolean): FlameGraph;
        computeDelta(): boolean;

        resetZoom(): void;
        onClick(val: ClickHandler): FlameGraph;
        onClick(): ClickHandler;
        setDetailsElement(val: HTMLElement | null): FlameGraph;
        setDetailsElement(): HTMLElement | null;
        setDetailsHandler(val: DetailsHandler): FlameGraph;
        setDetailsHandler(): FlameGraph;
        setSearchHandler(val: SearchHandler): FlameGraph;
        setSearchHandler(): FlameGraph;
        setColorMapper(val: ColorMapper): FlameGraph;
        setColorMapper(): FlameGraph;
        setColorHue(val: string): FlameGraph;
        setColorHue(): FlameGraph;
        setSearchMatch(val: SearchMatch): FlameGraph;
        setSearchMatch(): FlameGraph;

        search(term: string): void;
        clear(): void;
        merge(node: StackFrame): void;
        update(node: StackFrame): void;
        destroy(): void;
    }
}

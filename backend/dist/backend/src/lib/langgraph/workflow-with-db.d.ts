import { SelectedCard } from "../utils/card-picker";
import type { ReadingStructure } from "../../types/reading";
export declare const ReadingState: import("@langchain/langgraph").AnnotationRoot<{
    question: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    userId: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    locale: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    isValid: {
        (): import("@langchain/langgraph").LastValue<boolean>;
        (annotation: import("@langchain/langgraph").SingleReducer<boolean, boolean>): import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    validationReason: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    selectedCards: {
        (): import("@langchain/langgraph").LastValue<SelectedCard[]>;
        (annotation: import("@langchain/langgraph").SingleReducer<SelectedCard[], SelectedCard[]>): import("@langchain/langgraph").BinaryOperatorAggregate<SelectedCard[], SelectedCard[]>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    cardCount: {
        (): import("@langchain/langgraph").LastValue<number>;
        (annotation: import("@langchain/langgraph").SingleReducer<number, number>): import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    questionAnalysis: {
        (): import("@langchain/langgraph").LastValue<{
            mood: string;
            topic: string;
            period: string;
        }>;
        (annotation: import("@langchain/langgraph").SingleReducer<{
            mood: string;
            topic: string;
            period: string;
        }, {
            mood: string;
            topic: string;
            period: string;
        }>): import("@langchain/langgraph").BinaryOperatorAggregate<{
            mood: string;
            topic: string;
            period: string;
        }, {
            mood: string;
            topic: string;
            period: string;
        }>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    reading: {
        (): import("@langchain/langgraph").LastValue<ReadingStructure>;
        (annotation: import("@langchain/langgraph").SingleReducer<ReadingStructure, ReadingStructure>): import("@langchain/langgraph").BinaryOperatorAggregate<ReadingStructure, ReadingStructure>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    error: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    workflowError: {
        (): import("@langchain/langgraph").LastValue<string | null>;
        (annotation: import("@langchain/langgraph").SingleReducer<string | null, string | null>): import("@langchain/langgraph").BinaryOperatorAggregate<string | null, string | null>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    hasError: {
        (): import("@langchain/langgraph").LastValue<boolean>;
        (annotation: import("@langchain/langgraph").SingleReducer<boolean, boolean>): import("@langchain/langgraph").BinaryOperatorAggregate<boolean, boolean>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    errorSource: {
        (): import("@langchain/langgraph").LastValue<string | null>;
        (annotation: import("@langchain/langgraph").SingleReducer<string | null, string | null>): import("@langchain/langgraph").BinaryOperatorAggregate<string | null, string | null>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
}>;
export declare function executeWorkflowWithDB(question: string, cardCount?: number, userId?: string, locale?: string): Promise<ReadingStructure>;
export declare function generateTarotReading(question: string, userId?: string, locale?: string): Promise<{
    error: string;
    validationReason: string;
    isValid: boolean;
    reading?: undefined;
    questionAnalysis?: undefined;
    selectedCards?: undefined;
} | {
    reading: ReadingStructure;
    questionAnalysis: {
        mood: string;
        topic: string;
        period: string;
    };
    selectedCards: SelectedCard[];
    validationReason: string;
    isValid: boolean;
    error?: undefined;
} | {
    error: string;
    validationReason?: undefined;
    isValid?: undefined;
    reading?: undefined;
    questionAnalysis?: undefined;
    selectedCards?: undefined;
}>;
export declare function cleanupWorkflow(): Promise<void>;
//# sourceMappingURL=workflow-with-db.d.ts.map
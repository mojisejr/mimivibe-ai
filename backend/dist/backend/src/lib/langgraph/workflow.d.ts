/**
 * DEPRECATED: This workflow uses hardcoded prompts and is no longer used in production.
 * Production now uses workflow-with-db.ts which loads encrypted prompts from database.
 * This file is kept for reference only.
 */
import { SelectedCard } from "@/lib/utils/card-picker";
import type { ReadingStructure } from "@/types/reading";
export declare const ReadingState: import("@langchain/langgraph").AnnotationRoot<{
    question: {
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
}>;
export declare function createReadingWorkflow(): import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    question: {
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
}>, import("@langchain/langgraph").UpdateType<{
    question: {
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
}>, "questionFilter" | "cardPicker" | "questionAnalyzer" | "readingAgent" | "__start__", {
    question: {
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
}, {
    question: {
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
}, import("@langchain/langgraph").StateDefinition>;
export declare function generateTarotReading(question: string): Promise<{
    questionAnalysis: {
        mood: string;
        topic: string;
        period: string;
    };
    selectedCards: SelectedCard[];
    cardCount: number;
    reading: ReadingStructure;
}>;
//# sourceMappingURL=workflow.d.ts.map
import { object, optional, enum_, InferOutput, array } from 'valibot';

export enum QuestionType {
	massConsensus = 'mass-consensus',
	stageQuestion = 'stage-question',
}

export enum QuestionStage {
	explanation = 'explanation',
	needs = 'needs',
	research = 'research',
	discussion = 'discussion',
	suggestions = 'suggestions',
	summery = 'summery',
	other = 'other',
}

export enum QuestionSteps{
	explanation = 'explanation',
	suggest= 'suggest',
	similar = 'similar',
	randomEvaluation = 'random-evaluation',
	topEvaluation = 'top-evaluation',
	voting = 'voting',
	finished = 'finished',
}

export const QuestionSettingsSchema = object({
	questionType: optional(enum_(QuestionType)),
	currentStep: optional(enum_(QuestionSteps)),
	stages:optional(array(enum_(QuestionStage))),
});

export type QuestionSettings = InferOutput<typeof QuestionSettingsSchema>;

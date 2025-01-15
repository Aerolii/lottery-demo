<script setup lang="ts">
import { ref, reactive } from "vue"
import { Button } from "@/components/ui/button"
import { LotteryPool, LotteryAnimation } from "@/lib/lottery"
import { Check, Circle, Dot } from "lucide-vue-next"
import {
	Stepper,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@/components/ui/stepper"

const lottery = new LotteryPool()
const animation = new LotteryAnimation()

const displayNumbers = ref<string[]>(Array(10).fill("000"))
const count = ref(10)

const stepIndex = ref(1)

const steps = reactive([
	{
		step: 1,
		count: 10,
		title: "阳光普照",
		displayNumbers: Array(10).fill("000"),
	},
	{
		step: 2,
		count: 10,
		title: "三等奖",
		displayNumbers: Array(10).fill("000"),
	},
	{
		step: 3,
		count: 10,
		title: "阳光普照",
		displayNumbers: Array(10).fill("000"),
	},
	{ step: 4, count: 5, title: "二等奖", displayNumbers: Array(5).fill("000") },
	{
		step: 5,
		count: 10,
		title: "阳光普照",
		displayNumbers: Array(10).fill("000"),
	},
	{ step: 6, count: 2, title: "一等奖", displayNumbers: Array(2).fill("000") },
	{
		step: 7,
		count: 10,
		title: "阳光普照",
		displayNumbers: Array(10).fill("000"),
	},
])

const handleStart = (step) => {
	animation.start(step.count, (nums) => {
		step.displayNumbers = nums
		step.status = 1
	})
}

const handleStop = (step) => {
	const drawnNumbers = lottery.draw(step.count)
	animation.stop(drawnNumbers, (nums) => {
		step.displayNumbers = nums
		step.status = 2
	})
}

const handleRestart = (step, index: number) => {
	animation.start(1, ([nums]) => {
		step.displayNumbers[index] = nums
	})
}

const handleRestop = (step, index: number) => {
	const drawnNumbers = lottery.draw(1)
	animation.stop(drawnNumbers, ([nums]) => {
		step.displayNumbers[index] = nums
	})
}

const handleNext = (fn) => {
	if (stepIndex.value === steps.length - 1) {
		const len = lottery.pool.length
		steps[stepIndex.value].displayNumbers = lottery.pool
	}

	const prevStep = steps[stepIndex.value - 1]

	if (!prevStep.readonly) {
		const isReadonly = prevStep.displayNumbers.every((num) => num !== "000")
		prevStep.readonly = isReadonly
	}

	fn()
}
</script>

<template>
	<div class="min-h-screen w-full grid place-content-center">
		<Stepper
			v-slot="{ nextStep, prevStep }"
			v-model="stepIndex"
			class="block w-full border border-gray-200 rounded-lg shadow-lg bg-white p-4 space-y-4">
			<div class="flex w-full flex-start gap-2">
				<StepperItem
					v-for="step in steps"
					:key="step.step"
					v-slot="{ state }"
					class="relative flex w-full flex-col items-center justify-center"
					:step="step.step">
					<StepperSeparator
						v-if="step.step !== steps[steps.length - 1].step"
						class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />

					<StepperTrigger as-child>
						<Button
							:variant="
								state === 'completed' || state === 'active'
									? 'default'
									: 'outline'
							"
							size="icon"
							class="z-10 rounded-full shrink-0"
							:class="[
								state === 'active' &&
									'ring-2 ring-ring ring-offset-2 ring-offset-background',
							]">
							<Check v-if="state === 'completed'" class="size-5" />
							<Circle v-if="state === 'active'" />
							<Dot v-if="state === 'inactive'" />
						</Button>
					</StepperTrigger>

					<div class="mt-5 flex flex-col items-center text-center">
						<StepperTitle
							:class="[state === 'active' && 'text-primary']"
							class="text-sm font-semibold transition lg:text-base">
							{{ step.title }}
						</StepperTitle>
					</div>
				</StepperItem>
			</div>
			<template v-for="(step, index) in steps" :key="index">
				<template v-if="step.step === stepIndex">
					<div class="w-full grid place-content-center gap-3 backdrop-blur-sm">
						<div
							class="flex flex-wrap gap-2 min-h-[300px] w-[860px] place-content-center">
							<div
								v-for="(num, index) in step.displayNumbers"
								:key="index"
								class="text-7xl font-mono bg-red-600/90 text-yellow-300 rounded-2xl text-center shadow-lg transform transition-all duration-300 hover:scale-105 grid place-content-center p-2">
								<div
									class="flex justify-end"
									v-if="stepIndex < steps.length && !step.readonly">
									<Button variant="link" @click="handleRestart(step, index)">
										重新抽奖
									</Button>
									<Button variant="link" @click="handleRestop(step, index)">
										停止
									</Button>
								</div>
								<div class="row-span-2">{{ num }}</div>
							</div>
						</div>
						<div class="flex gap-6 justify-center">
							<Button
								@click.once="handleStart(step)"
								v-show="step.displayNumbers.every((num) => num === '000')"
								class="bg-yellow-500 hover:bg-yellow-600 text-red-900 text-xl px-8 py-4 rounded-xl shadow-lg transform transition hover:scale-105">
								开始抽奖
							</Button>
							<Button
								@click.once="handleStop(step)"
								v-show="
									step.displayNumbers.every((num) => num !== '000') &&
									step.status !== 2 &&
									stepIndex < steps.length
								"
								class="bg-red-600 hover:bg-red-700 text-yellow-300 text-xl px-8 py-4 rounded-xl shadow-lg transform transition hover:scale-105">
								停止
							</Button>
						</div>
					</div>
				</template>
			</template>
			<div class="flex place-content-end gap-4">
				<Button
					:disabled="stepIndex === 1 || steps[stepIndex - 1].status !== 2"
					variant="outline"
					size="lg"
					@click="prevStep()">
					查看上一轮抽奖结果
				</Button>

				<Button
					v-show="stepIndex <= steps.length - 1"
					:disabled="steps[stepIndex - 1].status !== 2"
					size="lg"
					@click="handleNext(nextStep)">
					下一轮抽奖
				</Button>
			</div>
		</Stepper>
	</div>
</template>

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

const { drawnNumbers } = lottery.getStatus()
const stepIndex = ref(1)

const recoverNums = reactive([])

const getSliceArray = (start, end, count) => {
	const arr = drawnNumbers.slice(start, end)
	if (arr.length) {
		if (arr.length === count) {
			return arr
		} else {
			return arr.concat(Array(count - arr.length).fill("000"))
		}
	}
	return Array(count).fill("000")
}

const getStatus = (start, end, count) => {
	return getSliceArray(start, end, count).every((num) => num !== "000") ? 2 : 1
}

const getReadonly = (start, end, count) => {
	return getSliceArray(start, end, count).every((num) => num !== "000")
}

const steps = reactive([
	{
		step: 1,
		count: 10,
		title: "阳光普照",
		displayNumbers: getSliceArray(0, 10, 10),
		status: getStatus(0, 10, 10),
		readonly: getReadonly(0, 10, 10),
	},
	{
		step: 2,
		count: 10,
		title: "三等奖",
		displayNumbers: getSliceArray(10, 20, 10),
		status: getStatus(10, 20, 10),
		readonly: getReadonly(10, 20, 10),
	},
	{
		step: 3,
		count: 10,
		title: "阳光普照",
		displayNumbers: getSliceArray(20, 30, 10),
		status: getStatus(20, 30, 10),
		readonly: getReadonly(20, 30, 10),
	},
	{
		step: 4,
		count: 5,
		title: "二等奖",
		displayNumbers: getSliceArray(30, 35, 5),
		status: getStatus(30, 35, 5),
		readonly: getReadonly(30, 35, 5),
	},
	{
		step: 5,
		count: 10,
		title: "阳光普照",
		displayNumbers: getSliceArray(35, 45, 10),
		status: getStatus(35, 45, 10),
		readonly: getReadonly(35, 45, 10),
	},
	{
		step: 6,
		count: 2,
		title: "一等奖",
		displayNumbers: getSliceArray(45, 47, 2),
		status: getStatus(45, 47, 2),
		readonly: getReadonly(45, 47, 2),
	},
	{
		step: 7,
		count: 10,
		title: "阳光普照",
		displayNumbers: drawnNumbers.remainingNumbers || Array(10).fill("000"),
		status: 2,
		readonly: true,
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

const handleRestart = (step, index: number, num: number) => {
	animation.start(1, ([nums]) => {
		step.displayNumbers[index] = nums
	})

	recoverNums.push({
		step: step.step,
		index,
		num,
	})
}

const handleRestop = (step, index: number) => {
	const indexSort = steps.reduce((acc, cur) => {
		if (cur.step < step.step) {
			const count = steps[cur.step - 1].count
			return acc + count
		}
		return acc
	}, 0)
	const drawnNumbers = lottery.redraw(indexSort + index, 1)
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
							disabled
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
									v-if="
										stepIndex < steps.length &&
										!step.readonly &&
										step.status === 2
									">
									<Button
										variant="link"
										@click="handleRestart(step, index, num)">
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
				<p
					v-if="recoverNums.length"
					class="text-sm text-gray-500 flex items-center">
					已重新抽奖号码：{{ recoverNums.map((item) => item.num).toString() }}
				</p>
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

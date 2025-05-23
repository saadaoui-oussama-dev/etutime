<script setup>
import VChart, { THEME_KEY } from 'vue-echarts';
import { computed, provide } from 'vue';
import LinearGradient from 'zrender/lib/graphic/LinearGradient';
import { formatDate, formatHumanReadableDuration, formatWeek } from '@/packages/ui/src/utils/time';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { useCssVar } from '@vueuse/core';

use([CanvasRenderer, BarChart, TitleComponent, GridComponent, TooltipComponent, LegendComponent]);

provide(THEME_KEY, 'dark');

const props = defineProps({
	groupedData: {
		type: Object,
		required: true,
	},
	groupedType: {
		type: [String, null],
		default: null,
	},
});

const xAxisLabels = computed(() => {
	if (props.groupedType === 'week') {
		return props?.groupedData?.map((el) => formatWeek(el.key));
	}
	return props?.groupedData?.map((el) => formatDate(el.key ?? ''));
});

const accentColor = useCssVar('--theme-color-chart', null, { observe: true });
const labelColor = useCssVar('--color-text-secondary', null, { observe: true });

const seriesData = computed(() => {
	return props?.groupedData?.map((el) => {
		return {
			value: el.seconds,
			...{
				itemStyle: {
					borderColor: new LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(' + accentColor.value + ',0.7)',
						},
						{
							offset: 1,
							color: 'rgba(' + accentColor.value + ',0.5)',
						},
					]),
					emphasis: {
						color: new LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: 'rgba(' + accentColor.value + ',0.9)',
							},
							{
								offset: 1,
								color: 'rgba(' + accentColor.value + ',0.7)',
							},
						]),
					},
					borderRadius: [12, 12, 0, 0],
					color: new LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(' + accentColor.value + ',0.7)',
						},
						{
							offset: 1,
							color: 'rgba(' + accentColor.value + ',0.5)',
						},
					]),
				},
			},
		};
	});
});

const option = computed(() => ({
	tooltip: {
		trigger: 'item',
	},
	grid: {
		top: 0,
		right: 0,
		bottom: 50,
		left: 0,
	},
	backgroundColor: 'transparent',
	xAxis: {
		type: 'category',
		data: xAxisLabels.value,
		markLine: {
			lineStyle: {
				color: 'rgba(125,156,188,0.1)',
				type: 'dashed',
			},
		},
		axisLine: {
			lineStyle: { color: 'transparent' },
		},
		axisLabel: {
			fontSize: 12,
			fontWeight: 600,
			color: labelColor.value,
			margin: 16,
			fontFamily: 'Outfit, sans-serif',
		},
		axisTick: {
			lineStyle: { color: 'transparent' },
		},
	},
	yAxis: {
		type: 'value',
		splitLine: {
			lineStyle: { color: 'rgba(125,156,188,0.2)' },
		},
	},
	series: [
		{
			data: seriesData.value,
			type: 'bar',
			tooltip: {
				valueFormatter: (value) => {
					return formatHumanReadableDuration(value);
				},
			},
		},
	],
}));
</script>

<template>
	<div class="w-[calc(100%-1px)]">
		<v-chart v-if="groupedData && groupedData?.length > 0" :autoresize="true" class="chart" :option="option" />
		<div v-else class="chart flex flex-col items-center justify-center">
			<p class="text-lg text-text-primary font-semibold">No time entries found</p>
			<p>Try to change the filters and time range</p>
		</div>
	</div>
</template>

<style scoped>
.chart {
	height: 300px;
	background: transparent;
}
</style>

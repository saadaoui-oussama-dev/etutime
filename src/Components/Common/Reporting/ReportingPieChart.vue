<script setup>
import VChart, { THEME_KEY } from 'vue-echarts';
import { computed, provide } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { formatHumanReadableDuration } from '@/packages/ui/src/utils/time';
import { useCssVar } from '@vueuse/core';

use([CanvasRenderer, PieChart, TitleComponent, GridComponent, TooltipComponent, LegendComponent]);

provide(THEME_KEY, 'dark');

const props = defineProps({
	data: {
		type: [Array, null],
		default: null,
	},
});

const labelColor = useCssVar('--color-text-secondary', null, { observe: true });

const seriesData = computed(() => {
	return props.data?.map((el) => {
		return {
			...el,
			...{
				itemStyle: {
					color: `${el.color}BB`,
				},
				emphasis: {
					itemStyle: {
						color: `${el.color}`,
					},
				},
			},
		};
	});
});

const option = computed(() => ({
	tooltip: {
		trigger: 'item',
	},
	legend: {
		show: true,
		top: '250px',
		textStyle: {
			color: labelColor.value,
		},
	},
	backgroundColor: 'transparent',
	series: [
		{
			label: {
				show: false,
			},
			tooltip: {
				valueFormatter: (value) => {
					return formatHumanReadableDuration(value);
				},
			},
			data: seriesData.value,
			radius: ['30%', '60%'],
			top: '-45%',
			type: 'pie',
		},
	],
}));
</script>

<template>
	<v-chart class="background-transparent max-w-[300px] mx-auto h-[460px]" :autoresize="true" :option="option" />
</template>

<style scoped></style>

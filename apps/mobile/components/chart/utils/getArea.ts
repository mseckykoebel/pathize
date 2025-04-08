// @ts-ignore
import {area} from 'd3-shape';
import {scaleLinear, curveLinear} from 'd3';

import type {LineChartData, LineChartPoint, YDomain} from '../types';

export function getArea({
  data,
  width,
  height,
  gutter,
  shape: _shape,
  yDomain,
}: {
  data: LineChartData;
  width: number;
  height: number;
  gutter: number;
  shape?: d3.CurveFactory | undefined;
  yDomain: YDomain;
}): string {
  const xValues = data.map((_, i) => i);

  const scaleX = scaleLinear()
    .domain([Math.min(...xValues), Math.max(...xValues)])
    .range([0, width]);
  const scaleY = scaleLinear()
    .domain([yDomain.min, yDomain.max])
    .range([height - gutter, gutter]);
  const pathArea = area<LineChartPoint>()
    .x((_, i) => scaleX(i))
    .y0(d => scaleY(d.y))
    .y1(() => height)
    .curve(_shape ?? curveLinear)(data);

  return pathArea || '';
}

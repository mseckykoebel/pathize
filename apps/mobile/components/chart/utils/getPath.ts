import {line, curveCatmullRom, scaleLinear} from 'd3';

import type {LineChartPoint, LineChartData, YDomain} from '../types';

export function getPath({
  data,
  from,
  to,
  width,
  height,
  gutter,
  nullCutoff,
  shape: _shape,
  yDomain,
  xDomain,
}: {
  data: LineChartData;
  from?: number;
  to?: number;
  width: number;
  height: number;
  gutter: number;
  nullCutoff?: number;
  shape?: d3.CurveFactory | undefined;
  yDomain: YDomain;
  xDomain?: [number, number];
}): string {
  const xValues = data.map(({x}, i) => (xDomain ? x : i));

  const scaleX = scaleLinear()
    .domain(xDomain ?? [Math.min(...xValues), Math.max(...xValues)])
    .range([0, width]);

  const scaleY = scaleLinear()
    .domain([yDomain.min, yDomain.max])
    .range([height - gutter, gutter]);

  const path = line<LineChartPoint>()
    .defined(d => {
      if (from || to) {
        console.log(
          data
            .slice(from, to ? to + 1 : undefined)
            .find(item => item.x === d.x),
        );
        const point = data
          .slice(from, to ? to + 1 : undefined)
          .find(item => item.x === d.x);
        return point && nullCutoff ? point.y > nullCutoff : false;
      } else {
        if (nullCutoff === undefined) return true;
        return d.y > nullCutoff;
      }
    })
    .x(d => scaleX(d.x))
    .y(d => scaleY(d.y))
    .curve(_shape ?? curveCatmullRom)(data);

  return path || 'M0,0';
}

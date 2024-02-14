import { numberFormat } from '../utilities'

// aggregator templates default to US number formatting but this is overridable
const usFmt = numberFormat();
const usFmtInt = numberFormat({digitsAfterDecimal: 0});
const usFmtPct = numberFormat({
  digitsAfterDecimal: 1,
  scaler: 100,
  suffix: '%',
});

const aggregatorTemplates = {
  count(formatter = usFmtInt) {
    return () =>
      function() {
        return {
          count: 0,
          push() {
            this.count++;
          },
          value() {
            return this.count;
          },
          format: formatter,
        };
      };
  },

  uniques(fn, formatter = usFmtInt) {
    return function([attr]) {
      return function() {
        return {
          uniq: [],
          push(record) {
            if (!Array.from(this.uniq).includes(record[attr])) {
              this.uniq.push(record[attr]);
            }
          },
          value() {
            return fn(this.uniq);
          },
          format: formatter,
          numInputs: typeof attr !== 'undefined' ? 0 : 1,
        };
      };
    };
  },

  sum(formatter = usFmt) {
    return function([attr]) {
      return function() {
        return {
          sum: 0,
          push(record) {
            if (!isNaN(parseFloat(record[attr]))) {
              this.sum += parseFloat(record[attr]);
            }
          },
          value() {
            return this.sum;
          },
          format: formatter,
          numInputs: typeof attr !== 'undefined' ? 0 : 1,
        };
      };
    };
  },

  extremes(mode, formatter = usFmt) {
    return function([attr]) {
      return function(data) {
        return {
          val: null,
          sorter: getSort(
            typeof data !== 'undefined' ? data.sorters : null,
            attr
          ),
          push(record) {
            let x = record[attr];
            if (['min', 'max'].includes(mode)) {
              x = parseFloat(x);
              if (!isNaN(x)) {
                this.val = Math[mode](x, this.val !== null ? this.val : x);
              }
            }
            if (
              mode === 'first' &&
              this.sorter(x, this.val !== null ? this.val : x) <= 0
            ) {
              this.val = x;
            }
            if (
              mode === 'last' &&
              this.sorter(x, this.val !== null ? this.val : x) >= 0
            ) {
              this.val = x;
            }
          },
          value() {
            return this.val;
          },
          format(x) {
            if (isNaN(x)) {
              return x;
            }
            return formatter(x);
          },
          numInputs: typeof attr !== 'undefined' ? 0 : 1,
        };
      };
    };
  },

  quantile(q, formatter = usFmt) {
    return function([attr]) {
      return function() {
        return {
          vals: [],
          push(record) {
            const x = parseFloat(record[attr]);
            if (!isNaN(x)) {
              this.vals.push(x);
            }
          },
          value() {
            if (this.vals.length === 0) {
              return null;
            }
            this.vals.sort((a, b) => a - b);
            const i = (this.vals.length - 1) * q;
            return (this.vals[Math.floor(i)] + this.vals[Math.ceil(i)]) / 2.0;
          },
          format: formatter,
          numInputs: typeof attr !== 'undefined' ? 0 : 1,
        };
      };
    };
  },

  runningStat(mode = 'mean', ddof = 1, formatter = usFmt) {
    return function([attr]) {
      return function() {
        return {
          n: 0.0,
          m: 0.0,
          s: 0.0,
          push(record) {
            const x = parseFloat(record[attr]);
            if (isNaN(x)) {
              return;
            }
            this.n += 1.0;
            if (this.n === 1.0) {
              this.m = x;
            }
            const m_new = this.m + (x - this.m) / this.n;
            this.s = this.s + (x - this.m) * (x - m_new);
            this.m = m_new;
          },
          value() {
            if (mode === 'mean') {
              if (this.n === 0) {
                return 0 / 0;
              }
              return this.m;
            }
            if (this.n <= ddof) {
              return 0;
            }
            switch (mode) {
              case 'var':
                return this.s / (this.n - ddof);
              case 'stdev':
                return Math.sqrt(this.s / (this.n - ddof));
              default:
                throw new Error('unknown mode for runningStat');
            }
          },
          format: formatter,
          numInputs: typeof attr !== 'undefined' ? 0 : 1,
        };
      };
    };
  },

  sumOverSum(formatter = usFmt) {
    return function([num, denom]) {
      return function() {
        return {
          sumNum: 0,
          sumDenom: 0,
          push(record) {
            if (!isNaN(parseFloat(record[num]))) {
              this.sumNum += parseFloat(record[num]);
            }
            if (!isNaN(parseFloat(record[denom]))) {
              this.sumDenom += parseFloat(record[denom]);
            }
          },
          value() {
            return this.sumNum / this.sumDenom;
          },
          format: formatter,
          numInputs:
            typeof num !== 'undefined' && typeof denom !== 'undefined' ? 0 : 2,
        };
      };
    };
  },

  fractionOf(wrapped, type = 'total', formatter = usFmtPct) {
    return (...x) =>
      function(data, rowKey, colKey) {
        return {
          selector: {total: [[], []], row: [rowKey, []], col: [[], colKey]}[
            type
          ],
          inner: wrapped(...Array.from(x || []))(data, rowKey, colKey),
          push(record) {
            this.inner.push(record);
          },
          format: formatter,
          value() {
            return (
              this.inner.value() /
              data
                .getAggregator(...Array.from(this.selector || []))
                .inner.value()
            );
          },
          numInputs: wrapped(...Array.from(x || []))().numInputs,
        };
      };
  },
};

aggregatorTemplates.countUnique = f =>
  aggregatorTemplates.uniques(x => x.length, f);
aggregatorTemplates.listUnique = s =>
  aggregatorTemplates.uniques(
    x => x.join(s),
    x => x
  );
aggregatorTemplates.max = f => aggregatorTemplates.extremes('max', f);
aggregatorTemplates.min = f => aggregatorTemplates.extremes('min', f);
aggregatorTemplates.first = f => aggregatorTemplates.extremes('first', f);
aggregatorTemplates.last = f => aggregatorTemplates.extremes('last', f);
aggregatorTemplates.median = f => aggregatorTemplates.quantile(0.5, f);
aggregatorTemplates.average = f =>
  aggregatorTemplates.runningStat('mean', 1, f);
aggregatorTemplates.var = (ddof, f) =>
  aggregatorTemplates.runningStat('var', ddof, f);
aggregatorTemplates.stdev = (ddof, f) =>
  aggregatorTemplates.runningStat('stdev', ddof, f);

// default aggregators & renderers use US naming and number formatting
const aggregators = (tpl => ({
  Count: tpl.count(usFmtInt),
  'Count Unique Values': tpl.countUnique(usFmtInt),
  'List Unique Values': tpl.listUnique(', '),
  Sum: tpl.sum(usFmt),
  'Integer Sum': tpl.sum(usFmtInt),
  Average: tpl.average(usFmt),
  Median: tpl.median(usFmt),
  'Sample Variance': tpl.var(1, usFmt),
  'Sample Standard Deviation': tpl.stdev(1, usFmt),
  Minimum: tpl.min(usFmt),
  Maximum: tpl.max(usFmt),
  First: tpl.first(usFmt),
  Last: tpl.last(usFmt),
  'Sum over Sum': tpl.sumOverSum(usFmt),
  'Sum as Fraction of Total': tpl.fractionOf(tpl.sum(), 'total', usFmtPct),
  'Sum as Fraction of Rows': tpl.fractionOf(tpl.sum(), 'row', usFmtPct),
  'Sum as Fraction of Columns': tpl.fractionOf(tpl.sum(), 'col', usFmtPct),
  'Count as Fraction of Total': tpl.fractionOf(tpl.count(), 'total', usFmtPct),
  'Count as Fraction of Rows': tpl.fractionOf(tpl.count(), 'row', usFmtPct),
  'Count as Fraction of Columns': tpl.fractionOf(tpl.count(), 'col', usFmtPct),
}))(aggregatorTemplates)

export {
  aggregatorTemplates,
  aggregators,
}

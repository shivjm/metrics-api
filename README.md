# Metrics API server

## Description

This is an HTTP server built in TypeScript that provides the following
API:

### POST `/metric/{key}`

Stores a value for the metric named by `{key}`.

### GET `/metric/{key}/sum`

Returns the sum of all metrics reported for `{key}` over the past hour
(this period is configurable).

## Running

1. `npm install -g pnpm`

2. `pnpm install`

3. `pnpm start`

### Configuration

The following environment variables can be used to configure the
server:

| Variable | Description | Default |
|----------|-------------|---------|
| `METRICS_APP_PORT` | Port on which to listen for connections | `3000` |
| `METRICS_APP_MAX_AGE_SECONDS` | Maximum age in seconds before metrics are deleted | `60` |
| `METRICS_APP_PRUNE_INTERVAL_SECONDS` | Interval in seconds at which to prune expired metrics | `1` |
| `METRICS_APP_LOG_LEVEL` | Level of log messages to show (from most output to least: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`) | `DEBUG` |

## Testing

1. `pnpm test`

## Building

1. `pnpm run build`

## How It Works

Metrics are stored using a variation on a linked list which tracks the
values and the times at which they were sent. The server maintains a
`Map` from metric names to these lists. Thanks to the use of the
[Performance measurement API](https://nodejs.org/api/perf_hooks.html),
the server has a monotonically increasing time source[^1] and new values are
appended to the list; therefore, the list is guaranteed to be sorted
from oldest to newest, and discarding old data involves traversing it
until we reach the first entry with a timestamp newer than our
threshold, which we then use as the new head of the list. This process
is carried out either periodically or on every `sum` request,
depending on the server’s configuration.

Instead of directly calling `performance.now()` or `new Date()`, the
`Metrics` class and functions that create it require the time source
to be passed in explicitly. This makes it trivial to test time-based
behaviour.

## Performance Notes

To minimize overhead, the nodes in the linked lists are represented as
bare objects conforming to interfaces (thanks to TypeScript), eliding
the need to run constructors or follow prototypes.

The downside of using a linked list is the need to traverse the entire
list to enumerate its entries, but since counting the metrics and
similar operations are not required in this case, there is no need to
enumerate those entries. The pruning function exploits the sorted
nature of the list to stop as soon as it encounters an entry that
should not be deleted. (Previous versions included an `IList`
interface which tracked the head node and tail node of the list
simultaneously, but as direct access to the tail was not required by
any operations, this extra structure could be removed.)

[^1] The absolute values are irrelevant since we only care about the
difference between any two timestamps.

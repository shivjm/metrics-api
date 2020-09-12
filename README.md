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

## Testing

1. `pnpm test`

## Building

1. `pnpm run build`

## How It Works

Metrics are stored using a variation on a linked list which tracks the
values and the times at which they were sent. The server maintains a
`Map` from metric names to these lists. Thanks to the use of the
[Performance measurement API](https://nodejs.org/api/perf_hooks.html),
the server has a monotonically increasing clock[1] and new values are
appended to the list; therefore, the list is guaranteed to be sorted
from oldest to newest, and discarding old data involves traversing it
until we reach the first entry with a timestamp newer than our
threshold, which we then use as the new head of the list. This process
is carried out either periodically or on every `sum` request,
depending on the server’s configuration.

[1] The absolute values are irrelevant since we only care about the
difference between any two timestamps.
<
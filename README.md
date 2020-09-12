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

1. `npm install`

2. `npm start`

### Configuration

The following environment variables can be used to configure the
server:

| Variable | Description | Default |
|----------|-------------|---------|
| `METRICS_APP_PORT` | Port on which to listen for connections | `3000` |
| `METRICS_APP_MAX_AGE_SECONDS` | Maximum age in seconds before metrics are deleted | `60` |
| `METRICS_APP_PRUNE_INTERVAL_SECONDS` | Interval in seconds at which to prune expired metrics | `1` |
| `METRICS_APP_LOG_LEVEL` | Level of log messages to show (from most output to least: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`) | `DEBUG` |

### Docker

The included Dockerfile can be built and run using any standard Docker
installation:

1. Build the image: `docker build -t metrics-server .` (where
   `metrics-server` can be any name you like)

1. Run the server: `docker run -it --rm -e 3000:3000 metrics-server`
   (where `metrics-server` is the name from the previous step and
   `3000:3000` can be replaced with, for example, `50000:3000` to
   expose the server on port 50000 of the local machine)
   
1. (In a separate session, as the server will need to keep running)
   Make a request:

   ```text
   λ curl -i -X POST -H "Content-Type: application/json" -d "{ \"value\": 4 }" localhost:3000/metric/foo
   HTTP/1.1 200 OK
   X-Powered-By: Express
   ETag: W/"a-bAsFyilMr4Ra1hIU5PyoyFRunpI"
   Date: Sat, 12 Sep 2020 19:05:04 GMT
   Connection: keep-alive
   
   {}
   
   λ curl -i localhost:3000/metric/foo/sum
   HTTP/1.1 200 OK
   X-Powered-By: Express
   Content-Type: text/html; charset=utf-8
   Content-Length: 1
   ETag: W/"1-G2RTiSRzpGfQc3LUXrBavCAxZHo"
   Date: Sat, 12 Sep 2020 19:07:53 GMT
   Connection: keep-alive
   
   4
   ```

## Testing

1. Install the dependencies: `npm install`

1. Run the tests: `npm test`

## Building

1. Install the dependencies: `npm install`

2. Run the build script: `npm run build`

The resultant JavaScript files can be found under `dist/`.

## How It Works

Metrics are stored using a variation on a linked list which tracks the
values and the times at which they were sent. The server maintains a
`Map` from metric names to these lists. Thanks to the use of the
[Performance measurement API](https://nodejs.org/api/perf_hooks.html),
the server has a monotonically increasing time source—the absolute
values are irrelevant since we only care about the difference between
any two timestamps—and new values are appended to the list; therefore,
the list is guaranteed to be sorted from oldest to newest, and
discarding old data involves traversing it until we reach the first
entry with a timestamp newer than our threshold, which we then use as
the new head of the list. This process is carried out either
periodically or on every `sum` request, depending on the server’s
configuration.

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

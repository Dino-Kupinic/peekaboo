from random import randint

from fastapi import FastAPI

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)


@app.get("/")
def read_root():
    return {"healthy": True}


@app.get("/roll")
def read_item():
    return str(roll())

def roll():
    with tracer.start_as_current_span("roll") as rollspan:
        result = randint(1,6)
        rollspan.set_attribute("roll.value" , result)
        return result
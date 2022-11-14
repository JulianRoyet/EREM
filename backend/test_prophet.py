import prophet
import cProfile

prophet.init()
pred = prophet.predict("tire à l ")

print("prediction made")
cd = [
    ["aRk", 0.4],
    ["vwa", 0.3],
    ["ch2v", 0.3]
]
with cProfile.Profile() as profiler:
    tuned = prophet.tune_prediction(pred, cd)
    print(tuned)

    tuned = prophet.tune_prediction(pred, cd)
    print(tuned)

    tuned = prophet.tune_prediction(pred, cd)
    print(tuned)

    tuned = prophet.tune_prediction(pred, cd)
    print(tuned)

    profiler.dump_stats("result.prof")

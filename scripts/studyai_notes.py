import json
import openai
from dotenv import load_dotenv, find_dotenv


# load environment
load_dotenv(find_dotenv())

client = openai.OpenAI()


class Studyai_Notes:
    def __init__(self, prompt, context):
        self.prompt = prompt
        self.context = context

    def note_taker(self):
        summaries = []

        for chunk in self.context:
            # Adjust temperature and max tokens as needed (model options gpt-3.5-turbo- 1106 or 0125)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": self.prompt},
                    {
                        "role": "user",
                        "content": f"The context:\n{chunk}",
                    },
                ],
                temperature=0.1,
                seed=2002,
                max_tokens=4096,
            )

            # Extract and print the generated summary
            summary = response.choices[0].message.content
            # print(response.usage)

            # add to list of summaries
            summaries.append(summary)

        return self.condensed_output(summaries)

    def condensed_output(self, summaries):
        # load json into python types
        result = json.loads(summaries[0])

        for summary in summaries[1:]:

            # load next chunk summary json into python types
            temp = json.loads(summary)
            if "summary" in temp.keys():
                result["summary"] += "\n" + temp["summary"]
            if "main_points" in temp.keys():
                for point in temp["main_points"]:
                    result["main_points"].append(point)
            if "key_words" in temp.keys():
                result["key_words"].update(temp["key_words"])
            if "mcq" in temp.keys():
                result["mcq"].update(temp["mcq"])

        # return final answer to json
        result = json.dumps(result, indent=4)

        return result

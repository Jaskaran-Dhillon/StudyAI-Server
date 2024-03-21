from studyai_notes import Studyai_Notes
from prompt import Prompt
from context import Context


def main():
    # PDF File Options: League_Rules_Guidelines.pdf     lec4.pdf    Topic14Part2.pdf    Topic2_Lecture2.pdf
    # Audio File Options: 4DN4 _Lecture_20240307.mp3
    # Video File Options: 4DN4 _Lecture_20240307.mp4
    file_path = "data/4DN4 _Lecture_20240307.mp4"
    verbosity_setting = 2
    summary_setting = True
    bullet_setting = True
    key_word_setting = True

    # get context from file
    context_creator = Context(file_path, verbosity_setting)

    context = context_creator.get_context()

    # create system prompt
    prompt_creator = Prompt(
        summary=summary_setting,
        bullet=bullet_setting,
        key_word=key_word_setting,
        equation=False,
        example=False,
        audio=True if ".mp3" in file_path or ".mp4" in file_path else False,
    )

    system_prompt = prompt_creator.create_prompt()

    study = Studyai_Notes(system_prompt, context)

    notes = study.note_taker()
    print(notes)


if __name__ == "__main__":
    main()

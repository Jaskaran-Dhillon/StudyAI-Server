from studyai_notes import Studyai_Notes
from prompt import Prompt


def main():
    prompt_creator = Prompt(
        verbosity=0,
        summary=True,
        bullet=True,
        key_word=False,
        equation=False,
        example=False,
    )

    system_prompt = prompt_creator.create_prompt()
    print(system_prompt)

    study = Studyai_Notes("data/League_Rules_Guidelines.pdf", "pdf")

    # print(study.get_context())

    notes = study.note_taker(system_prompt)
    print(notes)


if __name__ == "__main__":
    main()

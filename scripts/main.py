from studyai_notes import Studyai_Notes
from prompt import Prompt
import sys
# ard 1 = filename, arg2 = filetype, arg 3 = verbosity, arg4 = summary, arg5 = bullet, arg6 = keyWord

def main():
    # prompt_creator = Prompt(
    #     verbosity=0,
    #     summary=True,
    #     bullet=True,
    #     key_word=False,
    #     equation=False,
    #     example=False,
    # )
    prompt_creator = Prompt(
        verbosity=sys.argv[3],
        summary=True if (sys.argv[4] == "true") else False,
        bullet=True if (sys.argv[5] == "true") else False,
        key_word=True if (sys.argv[6] == "true") else False,
        equation=False,
        example=False,
    )

    system_prompt = prompt_creator.create_prompt()
    print(system_prompt)

    # study = Studyai_Notes("data/League_Rules_Guidelines.pdf", "pdf")
    study = Studyai_Notes("./dataset/" + sys.argv[1], sys.argv[2])
    
    # print(study.get_context())

    notes = study.note_taker(system_prompt)
    print(notes)


if __name__ == "__main__":
    main()

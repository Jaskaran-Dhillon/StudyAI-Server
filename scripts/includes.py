class Includes:
    def __init__(self, verbosity=0):
        if verbosity == 2:
            self.summary = "50%"
            self.bullet = "5 items"
            self.key_word = "3-5 key words"
            self.equation = ""
            self.example = ""

        elif verbosity == 1:
            self.summary = "30%"
            self.bullet = "3 items"
            self.key_word = "1-3 key words"
            self.equation = ""
            self.example = ""

        else:
            self.summary = "15%"
            self.bullet = "1 item"
            self.key_word = "1 key word"
            self.equation = ""
            self.example = ""

    def get_summary(self):
        return (
            '\nKey "summary" - create a summary that is atleast '
            + self.summary
            + " of the length of the context provided by the user, this should not be an array!"
        )

    def get_bullet(self):
        return (
            '\nKey "main_points" - add an array of the main points. Limit each item to 100 words, and limit the number of items to the most important '
            + self.bullet
            + " per 100 words of user context."
        )

    def get_keyword(self):
        return (
            '\nKey "key_words" - add an array of key terms. each item should include a key word and defintion in format "key word - definition". If a defintion is given explicitly in the context use it, if not use your general knowledge to define the term. Limit each definition to 20 words and limit the number of items to the most important '
            + self.key_word
            + " per 100 words of context."
        )

    def get_equations(self):
        return "equations"

    def get_examples(self):
        return "examples"

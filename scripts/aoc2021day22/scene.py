# manim -pqm scene.py Anim1 Anim2

from manim import *


class Anim1(Scene):
    def construct(self):
        number_plane = NumberPlane(
            background_line_style={
                "stroke_color": TEAL,
                "stroke_width": 2,
                "stroke_opacity": 0.5
            }
        )
        self.add(number_plane)

        text = MathTex(*'|A|').to_edge(UL)
        text2 = MathTex(*'|A', '\cup', *'B|').to_edge(UL)
        text3 = MathTex(*'|A', '\cup', 'B', '\cup', *'C|').to_edge(UL)

        fill_op = 0.6
        hide_op = 0.2
        pad = 0.6
        outpad = 1.4

        labels = []

        square_1 = Square(side_length=2.0, stroke_width=0).shift(UP)
        square_1.set_fill(YELLOW, opacity=fill_op)
        square_1_label = Text('A', fill_opacity=fill_op).move_to(square_1).shift(LEFT*pad, UP*outpad)
        square_1.add(square_1_label)
        self.play(Create(square_1), FadeIn(text))
        self.wait()

        square_2 = Square(side_length=2.0, stroke_width=0).shift(RIGHT)
        square_2.set_fill(BLUE, opacity=fill_op)
        square_2_label = Text('B', fill_opacity=fill_op).move_to(square_2).shift(RIGHT*outpad, UP*pad)
        square_2.add(square_2_label)
        self.play(Create(square_2), TransformMatchingTex(text, text2))
        self.wait()

        square_3 = Square(side_length=2.0, stroke_width=0).shift(LEFT * 0.5, DOWN * 0.5)
        square_3.set_fill(PINK, opacity=fill_op)
        square_3_label = Text('C', fill_opacity=fill_op).move_to(square_3).shift(LEFT*outpad, DOWN*pad)
        square_3.add(square_3_label)
        self.play(Create(square_3), TransformMatchingTex(text2, text3))
        self.wait(2)

        labels = [square_1_label, square_2_label, square_3_label]
        copies = [square_1.copy(), square_2.copy(), square_3.copy()]
        for i, c in enumerate(copies):
            c.set_fill(YELLOW_E, opacity=1)
            c.add(labels[i])
        ogs = [square_1, square_2, square_3]
        self.play(*[FadeTransform(og, next_) for og, next_ in zip(ogs, copies)], FadeOut(number_plane))
        self.wait(5)


class Anim2(Scene):
    def construct(self):
        number_plane = NumberPlane(
            background_line_style={
                "stroke_color": TEAL,
                "stroke_width": 2,
                "stroke_opacity": 0.5
            }
        )
        self.add(number_plane)

        text = MathTex(*'|A|').to_edge(UL)
        text2 = MathTex(*'|A', '\cup', *'B|-|B|').to_edge(UL)
        text3 = MathTex(*'|A', '\cup', 'B', '\cup', *'C|-|B', '\cup', *'C|+|C|').to_edge(UL)

        fill_op = 0.6
        hide_op = 0.2
        pad = 0.6
        outpad = 1.4

        square_1 = Square(side_length=2.0, stroke_width=0).shift(UP)
        square_1.set_fill(YELLOW, opacity=fill_op)
        square_1_label = Text('A', fill_opacity=fill_op).move_to(square_1).shift(LEFT*pad, UP*outpad)
        square_1.add(square_1_label)
        self.play(Create(square_1), FadeIn(text))
        self.wait()

        square_2 = Square(side_length=2.0, stroke_width=0).shift(RIGHT)
        square_2.set_fill(BLUE, opacity=hide_op) # Paint square 2 using a lower opacity!
        square_2_label = Text('B', fill_opacity=hide_op).move_to(square_2).shift(RIGHT*outpad, UP*pad)
        square_2.add(square_2_label)

        cut = Square(side_length=1.0, stroke_width=0).shift(UP * 0.5, RIGHT * 0.5)

        # Obtain the remaining cut of square 1.
        cutout = Cutout(square_1, cut, color=YELLOW, fill_opacity=fill_op, stroke_width=0)
        cutout.add(square_1_label)
        self.play(FadeTransform(square_1, cutout), Create(square_2), TransformMatchingTex(text, text2))
        self.wait()
        
        square_3 = Square(side_length=2.0, stroke_width=0).shift(LEFT * 0.5, DOWN * 0.5)
        square_3.set_fill(PINK, opacity=fill_op)
        square_3_label = Text('C', fill_opacity=fill_op).move_to(square_3).shift(LEFT*outpad, DOWN*pad)
        square_3.add(square_3_label)
        self.play(Create(square_3), TransformMatchingTex(text2, text3))
        self.wait(2)

        square_12 = cutout.copy()
        square_12.set_fill(YELLOW_E, opacity=1)
        square_12.add(square_1_label)
        square_32 = square_3.copy()
        square_32.set_fill(YELLOW_E, opacity=1)
        square_32.add(square_3_label)
        # labels = [square_1_label, square_2_label, square_3_label]
        self.play(FadeTransform(cutout, square_12), FadeTransform(square_3, square_32), FadeOut(square_2, number_plane))
        self.wait(5)

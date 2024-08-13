PASSWORD = 'password_5910f7f523cd780c67'

class Car:
    def __init__(self, make, year, color):
        self.make = make
        self.year = year
        self.color = color
    
    def __str__(self):
        return f'Car(make={self.make},year={self.year},color={self.color})'

s = input('Input: ')
car = Car("Toyota", 2020, "Blue")
print(s.format(car))
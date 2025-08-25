import abc


class AbstractBuilder(abc.ABC):
    @abc.abstractmethod
    def build(self):
        pass

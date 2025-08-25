import abc


class AbstractPresenter(abc.ABC):
    def __init__(self, data: dict):
        self._data = data

    @abc.abstractmethod
    def show(self):
        pass

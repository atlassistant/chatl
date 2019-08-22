# pylint: disable=C0111

from setuptools import setup, find_packages

with open('README.rst', encoding='utf-8') as f:
    README = f.read()

with open('pychatl/version.py') as f:
    VERSION = f.readlines()[1].strip()[15:-1]

setup(
    name='pychatl',
    version=VERSION,
    description='Tiny DSL to generate training dataset for NLU engines',
    long_description=README,
    url='https://github.com/atlassistant/chatl',
    author='Julien LEICHER',
    license='GPL-3.0',
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        'Programming Language :: Python :: 3',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
    ],
    install_requires=[
        'Arpeggio==1.9.0',
    ],
    extras_require={
        'test': [
            'nose==1.3.7',
            'sure==1.4.11',
        ],
    },
    entry_points={
        'console_scripts': [
            'pychatl = pychatl.cli:main',
        ]
    },
)

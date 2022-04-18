import json
import csv
import os

dialect = csv.Dialect
dialect.quoting = csv.QUOTE_NONE
dialect.delimiter = ";"
#dialect.escapechar = "\\"
dialect.lineterminator = "\r\n"


r = csv.reader(open("music/files.csv"), dialect)

l = []

for row in r:
    if (row[0] == "Title"):
        continue
    dict = {}
    dict["title"] = row[0]
    dict["artist"] = row[1]
    dict["path"] = os.path.relpath(row[-3] + row[-2]).replace("\\", "/")
    l.append(dict)

f = open("data.json", "w")

f.write(json.dumps(l))

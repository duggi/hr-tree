import paranoid
import json

input_file = "hr-data-masked.json"
output_file= "output2.json"
exclusions = ["Position ID", "Reports To Position ID", "HR First Name Lower Case", "Preferred First Name", "Job Title Description"]
with open(input_file) as input_file:
    input_dict =json.loads(input_file.read())
    #print(input_dict)
    output_dict = input_dict

datalist = input_dict
for dict in datalist:
    out_dict = dict
    for key in dict.keys():
        if key in exclusions:
            pass
        else:
            out_dict[key] = paranoid.maskGenerator(str(dict[key]),is_json=True)

print(datalist)

with open(output_file, 'w') as output_file:
    json.dump(output_dict, output_file, ensure_ascii=False, indent=2)
